<?php

namespace Tests\Feature;

use App\Models\Payslip;
use App\Models\PayslipUpload;
use App\Models\Position;
use App\Models\User;
use App\Services\PayslipService;
use App\Support\PayslipFields;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyPayslipTest extends TestCase
{
    use RefreshDatabase;

    protected function makePayslip(PayslipUpload $upload, User $user, array $data = []): Payslip
    {
        return $upload->payslips()->create([
            'user_id' => $user->id,
            'national_code' => $user->national_code,
            'employee_name' => trim(($user->first_name ?? '').' '.($user->last_name ?? '')),
            'data' => array_replace(array_fill_keys(PayslipFields::FIELDS, ''), $data),
        ]);
    }

    public function test_worker_only_sees_own_payslips_from_active_periods(): void
    {
        $position = Position::query()->create(['name' => 'کارشناس']);

        $worker = User::query()->create([
            'national_code' => '1000000001',
            'first_name' => 'کارمند',
            'last_name' => 'یک',
            'password' => 'password',
            'is_disable' => false,
            'position_id' => $position->id,
        ]);
        $other = User::query()->create([
            'national_code' => '1000000002',
            'first_name' => 'کارمند',
            'last_name' => 'دو',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $active = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => true,
        ]);
        $inactive = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 9,
            'is_active' => false,
        ]);

        $ownActive = $this->makePayslip($active, $worker, [
            'خالص پرداختی' => '9,500,000',
            'گروه' => 'گروه الف',
            'محل خدمت' => 'ستاد',
        ]);
        $this->makePayslip($inactive, $worker, ['خالص پرداختی' => '1,000']);
        $this->makePayslip($active, $other, ['خالص پرداختی' => '2,000']);

        $response = $this->actingAs($worker, 'api')
            ->getJson('/api/payslips/mine')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownActive->id)
            ->assertJsonPath('data.0.year', 1405)
            ->assertJsonPath('data.0.month', 8)
            ->assertJsonPath('data.0.position', 'کارشناس')
            ->assertJsonPath('data.0.group', 'گروه الف')
            ->assertJsonPath('data.0.workplace', 'ستاد')
            ->assertJsonMissingPath('data.0.net_pay')
            ->assertJsonMissingPath('data.0.uploaded_at');

        $this->assertSame(1, count($response->json('data')));
    }

    public function test_worker_payslips_are_sorted_newest_first(): void
    {
        $worker = User::query()->create([
            'national_code' => '1000000003',
            'password' => 'password',
            'is_disable' => false,
        ]);

        foreach ([5, 8, 7] as $month) {
            $upload = PayslipUpload::query()->create([
                'year' => 1405,
                'month' => $month,
                'is_active' => true,
            ]);
            $this->makePayslip($upload, $worker);
        }

        $months = collect(
            $this->actingAs($worker, 'api')->getJson('/api/payslips/mine')->json('data'),
        )->pluck('month')->all();

        $this->assertSame([8, 7, 5], $months);
    }

    public function test_worker_can_view_own_active_payslip(): void
    {
        $worker = User::query()->create([
            'national_code' => '1000000004',
            'first_name' => 'سارا',
            'last_name' => 'احمدی',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $upload = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => true,
        ]);

        $payslip = $this->makePayslip($upload, $worker, [
            'خالص پرداختی' => '12500000',
            'پاداش' => '500000',
        ]);

        $this->actingAs($worker, 'api')
            ->getJson("/api/payslips/mine/{$payslip->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.year', 1405)
            ->assertJsonPath('data.month', 8)
            ->assertJsonPath('data.national_code', '1000000004')
            ->assertJsonPath('data.display_name', 'سارا احمدی')
            ->assertJsonPath('data.data.خالص پرداختی', '12500000')
            ->assertJsonPath('data.data.پاداش', '500000');
    }

    public function test_worker_cannot_view_another_users_payslip(): void
    {
        $worker = User::query()->create([
            'national_code' => '1000000005',
            'password' => 'password',
            'is_disable' => false,
        ]);
        $other = User::query()->create([
            'national_code' => '1000000006',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $upload = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => true,
        ]);

        $payslip = $this->makePayslip($upload, $other);

        $this->actingAs($worker, 'api')
            ->getJson("/api/payslips/mine/{$payslip->id}")
            ->assertStatus(404);
    }

    public function test_worker_cannot_view_payslip_from_inactive_period(): void
    {
        $worker = User::query()->create([
            'national_code' => '1000000007',
            'password' => 'password',
            'is_disable' => false,
        ]);

        $upload = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => false,
        ]);

        $payslip = $this->makePayslip($upload, $worker);

        $this->actingAs($worker, 'api')
            ->getJson("/api/payslips/mine/{$payslip->id}")
            ->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_my_payslips(): void
    {
        $this->getJson('/api/payslips/mine')->assertStatus(401);
    }

    public function test_service_returns_empty_collection_for_unmatched_codes(): void
    {
        $worker = User::query()->create([
            'national_code' => '1000000008',
            'password' => 'password',
            'is_disable' => false,
        ]);

        // فیشی با user_id خالی (کد نامشخص در زمان آپلود) نباید به کسی نمایش داده شود.
        $upload = PayslipUpload::query()->create([
            'year' => 1405,
            'month' => 8,
            'is_active' => true,
        ]);
        $upload->payslips()->create([
            'user_id' => null,
            'national_code' => '9999999999',
            'data' => array_fill_keys(PayslipFields::FIELDS, ''),
        ]);

        $this->assertCount(0, app(PayslipService::class)->myPayslips($worker));
    }
}
