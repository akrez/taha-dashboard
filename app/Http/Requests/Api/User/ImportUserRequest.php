<?php

namespace App\Http\Requests\Api\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ImportUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'extensions:xlsx,xls,csv', 'mimes:xlsx,xls,csv,txt'],
            'deactivate_missing' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'file' => 'فایل اکسل',
            'deactivate_missing' => 'غیرفعال‌سازی افراد خارج از فایل',
        ];
    }
}
