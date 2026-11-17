<?php

namespace App\Models;

use App\Enums\ActivityStatusEnum;
use App\Enums\CivilStatusEnum;
use App\Enums\ContractTypeEnum;
use App\Enums\ProjectGroupEnum;
use App\Enums\ProjectTypeEnum;
use App\Enums\ProvinceEnum;
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
        'initial_amount_rials',
        'initial_amount_currency',
        'aggregate_amount_rials',
        'aggregate_amount_currency',
        'currency_unit',
        'remaining_amount',

        // اطلاعات زمانی قرارداد
        'contract_date',
        'notification_date',
        'project_start_date',
        'initial_contract_duration',
        'contract_end_date',
        'extended_contract_duration',
        'extended_contract_end_date',

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
        'project_group',
        'contract_status',
        'project_status',
        'contract_type',

        // عمرانی / غیرعمرانی
        'is_civil',

        // موقعیت جغرافیایی
        'country',
        'province',
        'county',

        // آدرس محل اجرای پروژه
        'workshop_address',

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
            'initial_amount_rials' => 'integer',
            'initial_amount_currency' => 'integer',
            'aggregate_amount_rials' => 'integer',
            'aggregate_amount_currency' => 'integer',
            'remaining_amount' => 'integer',
            'initial_contract_duration' => 'integer',
            'extended_contract_duration' => 'integer',
            'project_dimension' => 'decimal:2',
            'base_year' => 'integer',
            'is_active' => 'boolean',
            'is_civil' => CivilStatusEnum::class,
            'project_type' => ProjectTypeEnum::class,
            'project_group' => ProjectGroupEnum::class,
            'contract_type' => ContractTypeEnum::class,
            'activity_status' => ActivityStatusEnum::class,
            'province' => ProvinceEnum::class,
        ];
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function addenda(): HasMany
    {
        return $this->hasMany(Addendum::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
