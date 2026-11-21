<?php

namespace App\Http\Requests\Api\Payslip;

use Illuminate\Foundation\Http\FormRequest;

class StorePayslipUploadRequest extends FormRequest
{
    /**
     * The route is already guarded by the Payslip permission middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'extensions:xlsx,xls,csv', 'mimes:xlsx,xls,csv,txt', 'max:20480'],
            'year' => ['required', 'integer', 'between:1300,1500'],
            'month' => ['required', 'integer', 'between:1,12'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'file' => 'فایل اکسل',
            'year' => 'سال',
            'month' => 'ماه',
        ];
    }
}
