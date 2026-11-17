<?php

namespace App\Http\Requests\Api\Project;

use Illuminate\Foundation\Http\FormRequest;

abstract class BaseAddendumRequest extends FormRequest
{
    /**
     * مسیرها از قبل با middleware مجوز پروژه محافظت شده‌اند.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * مبالغ الحاقیه به‌صورت عدد صحیح (بدون اعشار) ذخیره می‌شوند.
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
     * @return array<string, mixed>
     */
    protected function sharedRules(): array
    {
        return [
            'duration' => [
                'nullable',
                'integer',
                'min:0',
                'max:65535',
            ],

            'amount_rials' => $this->amountRules(),

            'amount_currency' => $this->amountRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'number' => 'شماره الحاقیه',
            'duration' => 'مدت الحاقیه (ماه)',
            'amount_rials' => 'مبلغ الحاقیه (ریال)',
            'amount_currency' => 'مبلغ الحاقیه (ارزی)',
        ];
    }
}
