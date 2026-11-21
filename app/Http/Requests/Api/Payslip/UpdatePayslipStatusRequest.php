<?php

namespace App\Http\Requests\Api\Payslip;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayslipStatusRequest extends FormRequest
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
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'is_active' => 'وضعیت دوره',
        ];
    }
}
