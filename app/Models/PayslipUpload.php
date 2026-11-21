<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayslipUpload extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'year',
        'month',
        'is_active',
        'original_file_name',
        'uploaded_by',
        'total_rows',
        'imported_rows',
        'linked_rows',
        'unlinked_rows',
        'skipped_rows',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'month' => 'integer',
            'is_active' => 'boolean',
            'total_rows' => 'integer',
            'imported_rows' => 'integer',
            'linked_rows' => 'integer',
            'unlinked_rows' => 'integer',
            'skipped_rows' => 'integer',
        ];
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class, 'upload_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
