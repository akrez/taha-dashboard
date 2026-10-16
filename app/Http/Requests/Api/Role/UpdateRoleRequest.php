<?php

namespace App\Http\Requests\Api\Role;

use App\Models\Role;
use App\Services\RbacService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    /**
     * A protected role (e.g. the super admin role) must not be edited.
     */
    public function authorize(): bool
    {
        return ! RbacService::new()->isSuperAdminRoleName($this->role()->name);
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
                Rule::unique('roles', 'name')->ignore($this->role()->id),
            ],
        ];
    }

    private function role(): Role
    {
        return $this->route('role');
    }
}
