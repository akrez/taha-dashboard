<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'upload_id',
        'user_id',
        'national_code',
        'employee_name',
        'data',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    public function upload(): BelongsTo
    {
        return $this->belongsTo(PayslipUpload::class, 'upload_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * نام نمایشی: نام جاری کاربر در صورت وجود، در غیر این صورت نام داخل اکسل.
     */
    public function displayName(): string
    {
        $userName = trim(($this->user?->first_name ?? '').' '.($this->user?->last_name ?? ''));

        return $userName !== '' ? $userName : (string) $this->employee_name;
    }
}
