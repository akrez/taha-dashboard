<?php

namespace App\Services;

use App\Models\Payslip;
use App\Models\PayslipUpload;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PayslipService
{
    /**
     * همه دوره‌های آپلودشده، جدیدترین دوره اول.
     */
    public function uploads(): Collection
    {
        return PayslipUpload::query()
            ->with('uploadedBy')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();
    }

    /**
     * ردیف‌های فیش یک دوره با جستجو روی نام و کد پرسنلی.
     */
    public function payslips(PayslipUpload $upload, ?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        $search = $this->toEnglishDigits(trim((string) $search));

        return $upload->payslips()
            ->with('user')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('national_code', 'like', "%{$search}%")
                        ->orWhere('employee_name', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('id')
            ->paginate($perPage);
    }

    /**
     * فعال یا غیرفعال کردن یک دوره.
     *
     * هنگام فعال‌سازی، ابتدا سایر رکوردهای همان سال/ماه غیرفعال می‌شوند
     * و سپس فقط همین رکورد فعال می‌شود. سایر دوره‌ها دست‌نخورده می‌مانند.
     */
    public function setActive(PayslipUpload $upload, bool $active): PayslipUpload
    {
        return DB::transaction(function () use ($upload, $active): PayslipUpload {
            if ($active) {
                PayslipUpload::query()
                    ->where('year', $upload->year)
                    ->where('month', $upload->month)
                    ->where('id', '!=', $upload->id)
                    ->update(['is_active' => false]);
            }

            $upload->update(['is_active' => $active]);

            return $upload->refresh();
        });
    }

    public function findPayslip(PayslipUpload $upload, Payslip $payslip): Payslip
    {
        abort_unless($payslip->upload_id === $upload->id, 404);

        return $payslip->load('user');
    }

    /**
     * فیش‌های حقوقی خود کاربر؛ فقط دوره‌هایی که برای کارکنان فعال شده‌اند.
     * جدیدترین دوره اول برمی‌گردد.
     */
    public function myPayslips(User $user): Collection
    {
        return Payslip::query()
            ->where('user_id', $user->id)
            ->whereHas('upload', function ($query) {
                $query->where('is_active', true);
            })
            ->with('upload')
            ->get()
            ->sortByDesc(fn (Payslip $payslip) => (($payslip->upload?->year ?? 0) * 100) + ($payslip->upload?->month ?? 0))
            ->values();
    }

    /**
     * یک فیش از خود کاربر؛ فقط اگر دوره‌اش فعال باشد.
     */
    public function findMyPayslip(User $user, Payslip $payslip): Payslip
    {
        abort_unless($payslip->user_id === $user->id, 404);

        $payslip->load('upload');

        abort_unless($payslip->upload?->is_active === true, 404);

        return $payslip->load('user');
    }

    private function toEnglishDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }
}
