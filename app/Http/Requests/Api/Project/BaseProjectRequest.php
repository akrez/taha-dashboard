<?php

namespace App\Http\Requests\Api\Project;

use App\Enums\ActivityStatusEnum;
use App\Enums\CivilStatusEnum;
use App\Enums\ContractTypeEnum;
use App\Enums\ProjectGroupEnum;
use App\Enums\ProjectTypeEnum;
use App\Enums\ProvinceEnum;
use App\Rules\JalaliDate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class BaseProjectRequest extends FormRequest
{
    /**
     * تاریخ‌های شمسی پروژه.
     *
     * @var list<string>
     */
    private const DATE_FIELDS = [
        'contract_date',
        'notification_date',
        'project_start_date',
        'contract_end_date',
        'extended_contract_end_date',
    ];

    /**
     * مسیرها از قبل با middleware مجوز پروژه محافظت شده‌اند.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * تاریخ‌های شمسی ممکن است با ارقام فارسی/عربی ارسال شوند؛ همیشه Y-m-d انگلیسی ذخیره می‌شود.
     */
    protected function prepareForValidation(): void
    {
        $replace = [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ];

        $dates = [];

        foreach (self::DATE_FIELDS as $field) {
            $value = $this->input($field);

            if (is_string($value)) {
                $dates[$field] = strtr(trim($value), $replace);
            }
        }

        if ($dates !== []) {
            $this->merge($dates);
        }
    }

    /**
     * مبالغ ریالی/ارزی به‌صورت عدد صحیح (بدون اعشار) ذخیره می‌شوند.
     *
     * @return list<string>
     */
    protected function amountRules(): array
    {
        return [
            'nullable',
            'integer',
            'min:0',
            'max:999999999999999',
        ];
    }

    /**
     * قواعد مشترک ایجاد و ویرایش پروژه؛ فقط یکتایی «کد داخلی سپهر» بین این دو متفاوت است.
     *
     * @return array<string, mixed>
     */
    protected function sharedRules(): array
    {
        return [
            'project_name' => [
                'required',
                'string',
                'max:250',
            ],

            'contract_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^[\p{L}\p{N}\/\-_.]+$/u',
            ],

            'plan_code' => ['nullable', 'string', 'max:15'],

            // اطلاعات سازمانی
            'ministry' => ['nullable', 'string', 'max:40'],

            'consultant' => ['nullable', 'string', 'max:40'],

            'employer_id' => [
                'nullable',
                'integer',
                'exists:employers,id',
            ],

            // مبالغ (عدد صحیح بدون اعشار)
            'initial_amount_rials' => $this->amountRules(),

            'initial_amount_currency' => $this->amountRules(),

            'aggregate_amount_rials' => $this->amountRules(),

            'aggregate_amount_currency' => $this->amountRules(),

            'currency_unit' => ['nullable', 'string', 'max:10'],

            'remaining_amount' => $this->amountRules(),

            // اطلاعات زمانی (شمسی، Y-m-d)
            'contract_date' => ['nullable', new JalaliDate],
            'notification_date' => ['nullable', new JalaliDate],
            'project_start_date' => ['nullable', new JalaliDate],

            'initial_contract_duration' => [
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],

            'contract_end_date' => [
                'nullable',
                new JalaliDate('project_start_date', 'تاریخ شروع'),
            ],

            'extended_contract_duration' => [
                'nullable',
                'integer',
                'min:0',
                'max:999',
            ],

            'extended_contract_end_date' => [
                'nullable',
                new JalaliDate('contract_end_date', 'تاریخ پایان'),
            ],

            // ابعاد و شاخص پروژه
            'project_dimension' => [
                'nullable',
                'numeric',
                'between:0,999999999.99',
                'decimal:0,2',
            ],

            'unit' => ['nullable', 'string', 'max:10'],
            'base_index' => ['nullable', 'string', 'max:10'],

            'base_year' => [
                'nullable',
                'digits:4',
                'integer',
            ],

            // مشخصات تخصصی
            'field' => ['nullable', 'string', 'max:10'],
            'specialization' => ['nullable', 'string', 'max:20'],
            'acquisition_method' => ['nullable', 'string', 'max:15'],
            'nature' => ['nullable', 'string', 'max:10'],

            // وضعیت و نوع پروژه
            'status_code' => ['nullable', 'string', 'max:10'],
            'project_type' => [
                'nullable',
                Rule::in(ProjectTypeEnum::names()),
            ],
            'project_group' => [
                'nullable',
                Rule::in(ProjectGroupEnum::names()),
            ],
            'contract_status' => ['nullable', 'string', 'max:100'],
            'project_status' => ['nullable', 'string', 'max:20'],
            'contract_type' => [
                'nullable',
                Rule::in(ContractTypeEnum::names()),
            ],

            'is_civil' => [
                'nullable',
                Rule::in(CivilStatusEnum::names()),
            ],

            // موقعیت جغرافیایی
            'country' => ['nullable', 'string', 'max:10'],
            'province' => [
                'nullable',
                Rule::in(ProvinceEnum::names()),
            ],
            'county' => ['nullable', 'string', 'max:15'],

            // وضعیت فعالیت
            'activity_status' => [
                'required',
                Rule::in(ActivityStatusEnum::names()),
            ],
        ];
    }

    /**
     * برچسب فارسی فیلدها برای پیام‌های اعتبارسنجی.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            // مشخصات کلی قراردادی
            'internal_code' => 'کد داخلی سپهر',
            'project_name' => 'پروژه',
            'contract_number' => 'شماره قرارداد',
            'plan_code' => 'کد طرح',
            'field' => 'رشته',
            'specialization' => 'گرایش',
            'project_dimension' => 'حجم / طول / ابعاد پروژه',
            'unit' => 'واحد',
            'country' => 'کشور',
            'province' => 'استان',
            'county' => 'شهرستان',
            'nature' => 'ماهیت',

            // اطلاعات ریالی پروژه
            'initial_amount_rials' => 'مبلغ اولیه ریالی',
            'initial_amount_currency' => 'مبلغ اولیه ارزی',
            'currency_unit' => 'واحد ارزی',
            'remaining_amount' => 'مبلغ مانده',

            // مبلغ قرارداد براساس آخرین الحاقیه
            'aggregate_amount_rials' => 'مبلغ قرارداد ریالی',
            'aggregate_amount_currency' => 'مبلغ قرارداد ارزی',

            // اطلاعات زمانی پروژه
            'contract_date' => 'تاریخ انعقاد قرارداد',
            'notification_date' => 'تاریخ ابلاغ قرارداد',
            'project_start_date' => 'تاریخ شروع پروژه',
            'initial_contract_duration' => 'مدت پیمان اولیه به ماه',
            'contract_end_date' => 'تاریخ خاتمه پیمان',
            'extended_contract_duration' => 'مدت پیمان تمدید شده به ماه',
            'extended_contract_end_date' => 'تاریخ خاتمه پس از تمدید',

            // اطلاعات فنی پروژه
            'contract_type' => 'نوع پیمان',
            'acquisition_method' => 'نحوه اخذ',
            'status_code' => 'شناسه وضعیت',
            'base_index' => 'شاخص مبنا',
            'base_year' => 'سال مبنا',
            'project_type' => 'نوع پروژه',
            'project_group' => 'گروه پروژه',

            // ذینفعان پروژه
            'ministry' => 'وزارتخانه',
            'employer_id' => 'کارفرما',
            'consultant' => 'مشاور',
            'workshop_address' => 'آدرس کارگاه',

            // سایر
            'contract_status' => 'وضعیت قرارداد',
            'project_status' => 'وضعیت پروژه',
            'is_civil' => 'وضعیت عمرانی پروژه',
            'activity_status' => 'وضعیت فعالیت قرارداد',

            // وضعیت پروژه در سیستم
            'is_active' => 'وضعیت پروژه در سیستم',
        ];
    }
}
