<?php

namespace App\Http\Requests\Api\Role;

use App\Services\RbacService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateRoleRequest extends FormRequest
{
    /**
     * The route is already guarded by the super admin role middleware.
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::notIn([RbacService::superAdminRoleName()]),
                Rule::unique('roles', 'name'),
            ],
        ];
    }
}
