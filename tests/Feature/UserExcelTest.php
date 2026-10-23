<?php

namespace Tests\Feature;

use App\Exports\UsersExport;
use App\Models\Permission;
use App\Models\User;
use App\Services\UserImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class UserExcelTest extends TestCase
{
    use RefreshDatabase;

    protected UserImportService $importService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->importService = app(UserImportService::class);
    }

    /**
     * Helper to create an in-memory CSV/XLSX UploadedFile with given rows.
     */
    protected function createExcelFile(array $rows, string $extension = 'csv'): UploadedFile
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'test_excel_').'.'.$extension;
        $handle = fopen($tempPath, 'w');

        // Write UTF-8 BOM so Persian characters are preserved
        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }
        fclose($handle);

        return new UploadedFile($tempPath, 'test.'.$extension, 'text/csv', null, true);
    }

    public function test_persian_and_arabic_digits_are_converted_to_english()
    {
        $this->assertEquals('1234567890', $this->importService->toEnglishDigits('۱۲۳۴۵۶۷۸۹۰'));
        $this->assertEquals('1234567890', $this->importService->toEnglishDigits('١٢٣٤٥٦٧٨٩٠'));
    }

    public function test_validation_fails_when_national_code_is_missing_or_invalid()
    {
        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];
        $rowValid = ['ریلی', 'خط 10', 'فناوری', 'مدیر', '1001', '1010101010', 'علی', 'محمدی', 'رضا', 'قراردادی', 'فعال', ''];
        $rowInvalid = ['ریلی', 'خط 10', 'فناوری', 'مدیر', '1002', '12345678901234', 'حسن', 'حسنی', 'محسن', 'قراردادی', 'فعال', ''];

        $file = $this->createExcelFile([$headers, $rowValid, $rowInvalid]);

        try {
            $this->importService->import($file);
            $this->fail('ValidationException was expected');
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $this->assertArrayHasKey('rows', $errors);
            $this->assertStringContainsString('ردیف 3', $errors['rows'][0]);
            $this->assertStringContainsString('نامعتبر است', $errors['rows'][0]);
        }

        // بررسی All or Nothing: ردیف معتبر هم نباید ثبت شده باشد
        $this->assertDatabaseMissing('users', ['national_code' => '1010101010']);
    }

    public function test_validation_fails_on_duplicate_national_codes_in_file()
    {
        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];
        $row1 = ['ریلی', 'خط 10', 'فناوری', 'مدیر', '1001', '1010101010', 'علی', 'محمدی', 'رضا', 'قراردادی', 'فعال', ''];
        $row2 = ['ریلی', 'خط 10', 'فناوری', 'کارشناس', '1002', '1010101010', 'رضا', 'محمدی', 'رضا', 'قراردادی', 'فعال', ''];

        $file = $this->createExcelFile([$headers, $row1, $row2]);

        try {
            $this->importService->import($file);
            $this->fail('ValidationException was expected for duplicate national code');
        } catch (ValidationException $e) {
            $errors = $e->errors();
            $this->assertArrayHasKey('rows', $errors);
            $this->assertStringContainsString('تکراری است', $errors['rows'][0]);
            $this->assertStringContainsString('ردیف 3', $errors['rows'][0]);
            $this->assertStringContainsString('ردیف 2', $errors['rows'][0]);
        }
    }

    public function test_successful_import_with_persian_digits_relations_and_passwords()
    {
        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];

        // کاربر جدید بدون پسورد و وضعیت خالی -> فعال (is_disable = false)
        // کد ملی با ارقام فارسی و کمتر از ۱۰ رقم -> باید با ۰ به ۱۰ رقم برسد (۰۱۲۳۴۵۶۷۸۹ -> 0123456789)
        $row1 = ['مترو ریلی', 'خط 10', 'فناوری اطلاعات', 'مدیر فناوری اطلاعات', '۱۰۱۰', '۱۲۳۴۵۶۷۸۹', 'حسن', 'حسنی', 'محسن', 'قراردادی', '', ''];

        // کاربر جدید با پسورد دلخواه و وضعیت پر (غیرفعال) -> is_disable = true
        $row2 = ['صنعت', 'معدن چابهار', 'منابع انسانی', 'مدیر منابع انسانی', '2020', '2222222222', 'رضا', 'رضایی', 'علی', 'رسمی', 'غیرفعال', 'MySecretPass123'];

        $file = $this->createExcelFile([$headers, $row1, $row2]);

        $result = $this->importService->import($file);

        $this->assertEquals(2, $result['total_rows']);
        $this->assertEquals(2, $result['created_users']);

        // بررسی ایجاد روابط
        $this->assertDatabaseHas('disciplines', ['name' => 'مترو ریلی']);
        $this->assertDatabaseHas('projects', ['name' => 'خط 10']);
        $this->assertDatabaseHas('sections', ['name' => 'فناوری اطلاعات']);
        $this->assertDatabaseHas('positions', ['name' => 'مدیر فناوری اطلاعات']);

        // بررسی کاربر اول
        $user1 = User::where('national_code', '0123456789')->first();
        $this->assertNotNull($user1);
        $this->assertEquals('حسن', $user1->first_name);
        $this->assertEquals('1010', $user1->personnel_code);
        $this->assertFalse($user1->is_disable); // وضعیت خالی بود یعنی فعال (is_disable = false)
        $this->assertTrue(Hash::check('0123456789', $user1->password)); // پسورد پیش‌فرض همان کد ملی

        // بررسی کاربر دوم
        $user2 = User::where('national_code', '2222222222')->first();
        $this->assertNotNull($user2);
        $this->assertEquals('رضا', $user2->first_name);
        $this->assertTrue($user2->is_disable); // وضعیت پر بود یعنی غیرفعال (is_disable = true)
        $this->assertTrue(Hash::check('MySecretPass123', $user2->password)); // پسورد اختصاصی
    }

    public function test_existing_user_password_update_or_preserve()
    {
        // ایجاد یک کاربر قدیمی با پسورد موجود
        $oldUser1 = User::create([
            'national_code' => '3333333333',
            'first_name' => 'قدیمی ۱',
            'password' => 'OldPassword1',
            'is_disable' => false,
        ]);

        $oldUser2 = User::create([
            'national_code' => '4444444444',
            'first_name' => 'قدیمی ۲',
            'password' => 'OldPassword2',
            'is_disable' => false,
        ]);

        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];

        // کاربر ۱: پسورد در اکسل خالی است -> نباید تغییر کند
        $row1 = ['', '', '', '', '', '3333333333', 'نام آپدیت شده', '', '', '', '', ''];

        // کاربر ۲: پسورد در اکسل پر شده است -> باید آپدیت شود
        $row2 = ['', '', '', '', '', '4444444444', 'قدیمی ۲', '', '', '', '', 'BrandNewPassword'];

        $file = $this->createExcelFile([$headers, $row1, $row2]);

        $result = $this->importService->import($file);

        $this->assertEquals(2, $result['updated_users']);

        $oldUser1->refresh();
        $this->assertEquals('نام آپدیت شده', $oldUser1->first_name);
        $this->assertTrue(Hash::check('OldPassword1', $oldUser1->password));

        $oldUser2->refresh();
        $this->assertTrue(Hash::check('BrandNewPassword', $oldUser2->password));
    }

    public function test_super_admin_is_always_active_even_if_status_is_empty()
    {
        config(['permission.super_admin_national_codes' => '5151,5154']);

        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];

        // کد ملی سوپر ادمین با وضعیت پر (غیرفعال) -> باید حتما فعال بماند (is_disable = false)
        $row = ['', '', '', '', '', '5151', 'سوپر', 'ادمین', '', '', 'غیرفعال', ''];

        $file = $this->createExcelFile([$headers, $row]);

        $this->importService->import($file);

        $admin = User::where('national_code', '0000005151')->first();
        $this->assertNotNull($admin);
        $this->assertFalse($admin->is_disable); // باید حتما فعال بماند
    }

    public function test_deactivate_missing_mode_deactivates_missing_users()
    {
        $existing1 = User::create([
            'national_code' => '5555555555',
            'password' => 'pass',
            'is_disable' => false,
        ]);

        $existing2 = User::create([
            'national_code' => '6666666666',
            'password' => 'pass',
            'is_disable' => false,
        ]);

        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];

        // فقط existing1 در فایل هست
        $row = ['', '', '', '', '', '5555555555', 'کاربر ۱', '', '', '', '', ''];

        $file = $this->createExcelFile([$headers, $row]);

        // با deactivateMissing = true
        $result = $this->importService->import($file, deactivateMissing: true);

        $this->assertEquals(1, $result['deactivated_users']);

        $existing1->refresh();
        $existing2->refresh();

        $this->assertFalse($existing1->is_disable);
        $this->assertTrue($existing2->is_disable); // چون در فایل نبود، غیرفعال شد
    }

    public function test_api_export_and_import_endpoints_with_role_authorization()
    {
        config(['permission.super_admin_role_name' => 'SUPER_ADMIN']);
        config(['permission.super_admin_national_codes' => '9999999999']);

        // ایجاد پرمیشن‌ها در دیتابیس
        Permission::firstOrCreate(['name' => 'UserManager', 'guard_name' => 'api']);
        Permission::firstOrCreate(['name' => 'UserIndex', 'guard_name' => 'api']);

        $manager = User::create([
            'national_code' => '8888888888',
            'password' => 'password',
            'is_disable' => false,
        ]);
        $manager->givePermissionTo(['UserManager', 'UserIndex']);

        $headers = ['دیسیپلین', 'پروژه', 'نام قسمت', 'پست سازمانی', 'کد پرسنلی', 'کد ملی', 'نام', 'نام خانوادگی', 'نام پدر', 'نوع عضویت', 'وضعیت', 'رمز عبور'];
        $row = ['مترو', 'پروژه 1', 'قسمت 1', 'پست 1', '1234', '7777777777', 'تست', 'تستی', 'پدر', 'رسمی', '', ''];
        $file = $this->createExcelFile([$headers, $row]);

        // ۱. کاربر با نقش UserManager می‌تواند ایمپورت کند
        $response = $this->actingAs($manager, 'api')->postJson('/api/users/import', [
            'file' => $file,
            'deactivate_missing' => false,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'data' => [
                'total_rows',
                'created_users',
                'updated_users',
                'deactivated_users',
            ],
        ]);

        // ۲. تست خروجی (Export)
        $exportResponse = $this->actingAs($manager, 'api')->get('/api/users/export');
        $exportResponse->assertStatus(200);

        // ۳. کاربر معمولی بدون نقش UserManager نباید دسترسی داشته باشد (403)
        $normalUser = User::create([
            'national_code' => '1111111112',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $unauthorizedResponse = $this->actingAs($normalUser, 'api')->get('/api/users/export');
        $unauthorizedResponse->assertStatus(403);
    }

    public function test_export_and_reimport_preserves_exact_active_and_disabled_statuses()
    {
        $activeUser = User::create([
            'national_code' => '1111111111',
            'first_name' => 'فعال',
            'password' => 'pass',
            'is_disable' => false,
        ]);

        $disabledUser = User::create([
            'national_code' => '2222222221',
            'first_name' => 'غیرفعال',
            'password' => 'pass',
            'is_disable' => true,
        ]);

        $export = new UsersExport;
        $headers = $export->headings();
        $rowActive = $export->map($activeUser);
        $rowDisabled = $export->map($disabledUser);

        // شبیه‌سازی فایل خروجی گرفته‌شده
        $file = $this->createExcelFile([$headers, $rowActive, $rowDisabled]);

        // ایمپورت مجدد همان فایل
        $result = $this->importService->import($file);

        $this->assertEquals(2, $result['updated_users']);

        $activeUser->refresh();
        $disabledUser->refresh();

        $this->assertFalse($activeUser->is_disable, 'کاربر فعال باید فعال بماند');
        $this->assertTrue($disabledUser->is_disable, 'کاربر غیرفعال باید غیرفعال بماند');
    }
}
