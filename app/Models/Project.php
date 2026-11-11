<?php

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    protected $fillable = [
        // شناسه و مشخصات پروژه
        'internal_code',
        'project_name',
        'contract_number',
        'plan_code',

        // اطلاعات سازمانی
        'ministry',
        'employer_id',
        'consultant',

        // مبالغ
        'initial_amount_billion_rials',
        'initial_amount_million_currency',
        'aggregate_amount',
        'remaining_amount',

        // اطلاعات زمانی قرارداد
        'contract_date',
        'notification_date',
        'start_date',
        'initial_duration',
        'end_date',
        'extended_duration',
        'extended_end_date',

        // ابعاد و شاخص پروژه
        'project_dimension',
        'unit',
        'base_index',
        'base_year',

        // مشخصات تخصصی
        'field',
        'specialization',
        'acquisition_method',
        'nature',

        // وضعیت و نوع پروژه و قرارداد
        'status_code',
        'project_type',
        'contract_status',
        'project_status',
        'contract_type',

        // عمرانی / غیرعمرانی
        'is_civil',

        // موقعیت جغرافیایی
        'country',
        'province',
        'county',

        // وضعیت فعالیت
        'activity_status',

        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'initial_amount_billion_rials' => 'decimal:2',
            'initial_amount_million_currency' => 'decimal:2',
            'aggregate_amount' => 'decimal:2',
            'remaining_amount' => 'integer',
            'initial_duration' => 'integer',
            'extended_duration' => 'integer',
            'project_dimension' => 'decimal:2',
            'base_year' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
