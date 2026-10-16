<?php

namespace App\Http\Requests\Api\Role;

use App\Models\Role;
use App\Services\RbacService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRoleUsersRequest extends FormRequest
{
    /**
     * A protected role (e.g. the super admin role) keeps its users untouched.
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
            'users' => ['present', 'array'],
            'users.*' => ['integer', Rule::exists('users', 'id')],
        ];
    }

    private function role(): Role
    {
        return $this->route('role');
    }
}
