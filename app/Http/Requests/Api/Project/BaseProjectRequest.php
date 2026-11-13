<?php

namespace App\Http\Requests\Api\Project;

use App\Enums\ActivityStatusEnum;
use App\Enums\CivilStatusEnum;
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
        'start_date',
        'end_date',
        'extended_end_date',
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

            // مبالغ
            'initial_amount_billion_rials' => [
                'nullable',
                'numeric',
                'between:0,9999999999999.99',
                'decimal:0,2',
            ],

            'initial_amount_million_currency' => [
                'nullable',
                'numeric',
                'between:0,9999999999999.99',
                'decimal:0,2',
            ],

            'aggregate_amount' => [
                'nullable',
                'numeric',
                'between:0,9999999999999.99',
                'decimal:0,2',
            ],

            'remaining_amount' => [
                'nullable',
                'integer',
                'min:0',
                'max:9999999999',
            ],

            // اطلاعات زمانی (شمسی، Y-m-d)
            'contract_date' => ['nullable', new JalaliDate],
            'notification_date' => ['nullable', new JalaliDate],
            'start_date' => ['nullable', new JalaliDate],

            'initial_duration' => [
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],

            'end_date' => [
                'nullable',
                new JalaliDate('start_date', 'تاریخ شروع'),
            ],

            'extended_duration' => [
                'nullable',
                'integer',
                'min:0',
                'max:999',
            ],

            'extended_end_date' => [
                'nullable',
                new JalaliDate('end_date', 'تاریخ پایان'),
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
            'project_type' => ['nullable', 'string', 'max:20'],
            'contract_status' => ['nullable', 'string', 'max:100'],
            'project_status' => ['nullable', 'string', 'max:20'],
            'contract_type' => ['nullable', 'string', 'max:20'],

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
            // مشخصات پروژه
            'internal_code' => 'کد داخلی سپهر',
            'project_name' => 'نام پروژه',
            'contract_number' => 'شماره قرارداد',
            'plan_code' => 'کد طرح',

            // اطلاعات سازمانی
            'ministry' => 'وزارتخانه',
            'employer_id' => 'کارفرما',
            'consultant' => 'مشاور',

            // مبالغ
            'initial_amount_billion_rials' => 'مبلغ اولیه (میلیارد ریال)',
            'initial_amount_million_currency' => 'مبلغ اولیه (میلیون ارزی)',
            'aggregate_amount' => 'مبلغ تجمیع',
            'remaining_amount' => 'مبلغ مانده',

            // اطلاعات زمانی
            'contract_date' => 'تاریخ عقد قرارداد',
            'notification_date' => 'تاریخ ابلاغ',
            'start_date' => 'تاریخ شروع',
            'initial_duration' => 'مدت اولیه قرارداد',
            'end_date' => 'تاریخ پایان',
            'extended_duration' => 'مدت تمدید شده',
            'extended_end_date' => 'تاریخ خاتمه تمدید شده',

            // ابعاد و شاخص
            'project_dimension' => 'ابعاد پروژه',
            'unit' => 'واحد',
            'base_index' => 'شاخص مبنا',
            'base_year' => 'سال مبنا',

            // مشخصات تخصصی
            'field' => 'رشته',
            'specialization' => 'گرایش',
            'acquisition_method' => 'روش اخذ',
            'nature' => 'ماهیت',

            // وضعیت پروژه
            'status_code' => 'کد وضعیت',
            'project_type' => 'نوع پروژه',
            'contract_status' => 'وضعیت قرارداد',
            'project_status' => 'وضعیت پروژه',
            'contract_type' => 'نوع پیمان',
            'is_civil' => 'وضعیت عمرانی پروژه',

            // موقعیت جغرافیایی
            'country' => 'کشور',
            'province' => 'استان',
            'county' => 'شهرستان',

            // وضعیت فعالیت
            'activity_status' => 'وضعیت فعالیت',

            // وضعیت پروژه در سیستم
            'is_active' => 'وضعیت پروژه در سیستم',
        ];
    }
}
