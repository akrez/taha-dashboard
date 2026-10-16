<?php

namespace App\Http\Requests\Api\Role;

use App\Models\Role;
use App\Services\RbacService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRolePermissionsRequest extends FormRequest
{
    /**
     * A protected role (e.g. the super admin role) keeps its permissions untouched.
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
            'permissions' => ['present', 'array'],
            'permissions.*' => ['integer', Rule::exists('permissions', 'id')],
        ];
    }

    private function role(): Role
    {
        return $this->route('role');
    }
}
