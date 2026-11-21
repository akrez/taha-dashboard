<?php

namespace Tests\Feature;

use App\Models\Payslip;
use App\Models\PayslipUpload;
use App\Models\Permission;
use App\Models\User;
use App\Services\PayslipImportService;
use App\Services\PayslipService;
use App\Support\PayslipFields;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PayslipUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function createExcelFile(array $rows, ?array $headers = null, string $extension = 'csv'): UploadedFile
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'payslip_').'.'.$extension;
        $handle = fopen($tempPath, 'w');

        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

        fputcsv($handle, $headers ?? PayslipFields::FIELDS);

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        fclose($handle);

        return new UploadedFile($tempPath, 'payslips.'.$extension, 'text/csv', null, true);
    }

    /**
     * @param  array<string, string>  $values
     * @return list<string>
     */
    protected function row(array $values = []): array
    {
        $row = array_fill_keys(PayslipFields::FIELDS, '');

        return array_values(array_replace($row, $values));
    }

    public function test_import_creates_inactive_period_and_links_user_by_national_code(): void
    {
        $user = User::query()->create([
            'national_code' => '0012345678',
            'first_name' => 'علی',
            'last_name' => 'رضایی',
            'password' => 'pass',
            'is_disable' => false,
        ]);

        $file = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'علی رضایی',
                'کد پرسنلی' => '۱۲۳۴۵۶۷۸',
                'پاداش' => '1,200,000',
                'مرکز هزینه' => '۱۰۱',
                'حق مسکن' => '',
            ]),
        ]);

        $result = app(PayslipImportService::class)->import($file, 1405, 8);

        $upload = $result['upload'];

        $this->assertSame(1405, $upload->year);
        $this->assertSame(8, $upload->month);
        $this->assertFalse($upload->is_active);
        $this->assertSame(1, $upload->total_rows);
        $this->assertSame(1, $upload->imported_rows);
        $this->assertSame(1, $upload->linked_rows);
        $this->assertSame(0, $upload->unlinked_rows);
        $this->assertSame(0, $upload->skipped_rows);

        $payslip = Payslip::query()->firstOrFail();

        $this->assertSame($user->id, $payslip->user_id);
        $this->assertSame('0012345678', $payslip->national_code);
        $this->assertSame('علی رضایی', $payslip->employee_name);
        $this->assertSame('1200000', $payslip->data['پاداش']);
        $this->assertSame('101', $payslip->data['مرکز هزینه']);
        $this->assertSame('', $payslip->data['حق مسکن']);
    }

    public function test_unknown_national_code_is_saved_without_user(): void
    {
        $file = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'کاربر ناشناس',
                'کد پرسنلی' => '9999999999',
                'حق مسکن' => '500000',
            ]),
        ]);

        $result = app(PayslipImportService::class)->import($file, 1405, 9);

        $this->assertSame(0, $result['linked_rows']);
        $this->assertSame(1, $result['unlinked_rows']);

        $payslip = Payslip::query()->firstOrFail();
        $this->assertNull($payslip->user_id);
        $this->assertSame('کاربر ناشناس', $payslip->employee_name);
    }

    public function test_duplicate_national_codes_use_the_last_row(): void
    {
        $file = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'نام اول',
                'کد پرسنلی' => '1111111111',
                'حق مسکن' => '100',
            ]),
            $this->row([
                'نام و نام خانوادگی کارمند' => 'نام دوم',
                'کد پرسنلی' => '1111111111',
                'حق مسکن' => '200',
            ]),
        ]);

        $result = app(PayslipImportService::class)->import($file, 1405, 10);

        $this->assertSame(2, $result['total_rows']);
        $this->assertSame(1, $result['imported_rows']);
        $this->assertDatabaseCount('payslips', 1);

        $payslip = Payslip::query()->firstOrFail();
        $this->assertSame('نام دوم', $payslip->employee_name);
        $this->assertSame('200', $payslip->data['حق مسکن']);
    }

    public function test_invalid_codes_are_skipped_but_valid_rows_are_saved(): void
    {
        $file = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'ردشده',
                'کد پرسنلی' => '12345678901',
            ]),
            $this->row([
                'نام و نام خانوادگی کارمند' => 'پذیرفته‌شده',
                'کد پرسنلی' => '2222222222',
            ]),
        ]);

        $result = app(PayslipImportService::class)->import($file, 1405, 11);

        $this->assertSame(1, $result['skipped_rows']);
        $this->assertSame(1, $result['imported_rows']);
        $this->assertCount(1, $result['warnings']);
        $this->assertStringContainsString('ردیف 2', 'ردیف '.$result['warnings'][0]['row']);

        $payslip = Payslip::query()->firstOrFail();
        $this->assertSame('2222222222', $payslip->national_code);
    }

    public function test_file_with_no_valid_rows_does_not_replace_existing_period(): void
    {
        $validFile = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'قبلی',
                'کد پرسنلی' => '3333333333',
            ]),
        ]);

        $first = app(PayslipImportService::class)->import($validFile, 1405, 12);

        $invalidFile = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'نامعتبر',
                'کد پرسنلی' => 'not-a-code',
            ]),
        ]);

        try {
            app(PayslipImportService::class)->import($invalidFile, 1405, 12);
            $this->fail('ValidationException was expected.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('rows', $exception->errors());
        }

        $this->assertDatabaseHas('payslip_uploads', ['id' => $first['upload']->id]);
        $this->assertSame(1, PayslipUpload::query()->count());
        $this->assertSame(1, Payslip::query()->count());
    }

    public function test_reupload_same_period_deletes_previous_upload_and_rows(): void
    {
        $firstFile = $this->createExcelFile([
            $this->row(['نام و نام خانوادگی کارمند' => 'اول', 'کد پرسنلی' => '4444444444']),
        ]);

        $first = app(PayslipImportService::class)->import($firstFile, 1405, 7);

        $secondFile = $this->createExcelFile([
            $this->row(['نام و نام خانوادگی کارمند' => 'دوم', 'کد پرسنلی' => '5555555555']),
        ]);

        $second = app(PayslipImportService::class)->import($secondFile, 1405, 7);

        $this->assertDatabaseMissing('payslip_uploads', ['id' => $first['upload']->id]);
        $this->assertSame(1, PayslipUpload::query()->count());
        $this->assertSame(1, Payslip::query()->count());
        $this->assertSame($second['upload']->id, Payslip::query()->firstOrFail()->upload_id);
        $this->assertFalse($second['upload']->is_active);
    }

    public function test_activation_only_affects_the_same_period(): void
    {
        $service = app(PayslipService::class);

        $august = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => false,
        ]);
        $september = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 9,
            'is_active' => false,
        ]);

        $service->setActive($august, true);
        $this->assertTrue($august->refresh()->is_active);

        $service->setActive($september, true);
        $this->assertTrue($september->refresh()->is_active);
        $this->assertTrue($august->refresh()->is_active);

        $service->setActive($september, false);
        $this->assertFalse($september->refresh()->is_active);
        $this->assertTrue($august->refresh()->is_active);
    }

    public function test_api_endpoints_require_permission_and_support_upload_workflow(): void
    {
        config(['permission.super_admin_role_name' => 'SUPER_ADMIN']);
        config(['permission.super_admin_national_codes' => '9999999999']);

        Permission::query()->firstOrCreate(['name' => 'Payslip', 'guard_name' => 'api']);

        $manager = User::query()->create([
            'national_code' => '8888888888',
            'first_name' => 'مدیر',
            'last_name' => 'منابع انسانی',
            'password' => 'password',
            'is_disable' => false,
        ]);
        $manager->givePermissionTo('Payslip');

        $file = $this->createExcelFile([
            $this->row([
                'نام و نام خانوادگی کارمند' => 'کارمند تست',
                'کد پرسنلی' => '6666666666',
                'خالص پرداختی' => '12,500,000',
            ]),
        ]);

        $uploadResponse = $this->actingAs($manager, 'api')->postJson('/api/payslips/uploads', [
            'file' => $file,
            'year' => 1405,
            'month' => 6,
        ]);

        $uploadResponse->assertStatus(201);
        $uploadResponse->assertJsonStructure([
            'message',
            'data' => ['id', 'year', 'month', 'is_active'],
            'summary' => ['total_rows', 'imported_rows', 'linked_rows', 'unlinked_rows', 'skipped_rows'],
        ]);

        $uploadId = $uploadResponse->json('data.id');

        $this->actingAs($manager, 'api')
            ->getJson('/api/payslips/uploads')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $showResponse = $this->actingAs($manager, 'api')
            ->getJson("/api/payslips/uploads/{$uploadId}")
            ->assertStatus(200)
            ->assertJsonStructure([
                'upload' => ['id'],
                'payslips' => ['data', 'current_page', 'last_page', 'per_page', 'total'],
            ]);

        $payslipId = $showResponse->json('payslips.data.0.id');

        $this->actingAs($manager, 'api')
            ->patchJson("/api/payslips/uploads/{$uploadId}/status", ['is_active' => true])
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', true);

        $this->actingAs($manager, 'api')
            ->getJson("/api/payslips/uploads/{$uploadId}/payslips/{$payslipId}")
            ->assertStatus(200)
            ->assertJsonPath('data.national_code', '6666666666')
            ->assertJsonPath('data.data.خالص پرداختی', '12500000');

        $normalUser = User::query()->create([
            'national_code' => '7777777777',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $this->actingAs($normalUser, 'api')
            ->getJson('/api/payslips/uploads')
            ->assertStatus(403);
    }
}
