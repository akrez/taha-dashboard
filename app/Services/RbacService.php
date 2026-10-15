<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class RbacService
{
    public static function new()
    {
        return app(self::class);
    }

    public static function superAdminRoleName()
    {
        return app(self::class)->getSuperAdminRoleName();
    }

    // assign x to x

    public function giveRolePermission($role, $permission)
    {
        $role->givePermissionTo($permission);
    }

    public function giveUserPermission(User $user, $permission)
    {
        $user->givePermissionTo($permission);
    }

    public function assignUserRole(User $user, ...$roles)
    {
        $user->assignRole(...$roles);
    }

    public function syncRolePermissions(Role $role, $permissions)
    {
        $role->syncPermissions($permissions);
    }

    public function syncRolePermissionsById(Role $role, $permissions)
    {
        $permissions = (array) ($permissions);
        $permissionNames = Permission::query()->whereIn('id', $permissions)->get()->pluck('name')->toArray();
        $this->syncRolePermissions($role, $permissionNames);
    }

    public function syncUserPermissions(User $user, $permissions)
    {
        $user->syncPermissions($permissions);
    }

    public function syncUserPermissionsById(User $user, $permissions)
    {
        $this->syncUserPermissions(
            $user,
            Permission::query()->whereIn('id', (array) ($permissions))->get()
        );
    }

    public function syncUserRoles(User $user, $roles)
    {
        $user->syncRoles($roles);
    }

    public function syncUserRolesById(User $user, $roles)
    {
        $this->syncUserRoles(
            $user,
            Role::query()->whereIn('id', (array) ($roles))->get()
        );
    }

    // model main functions

    public function findOrCreatePermission(string $name, ?string $guardName = 'api')
    {
        return app(Permission::class)->findOrCreate($name, $guardName);
    }

    public function findOrCreateRole(string $name, ?string $guardName = 'api')
    {
        return app(Role::class)->findOrCreate($name, $guardName);
    }

    public function createRole(string $name, ?string $guardName = 'api')
    {
        return app(Role::class)->create(['name' => $name, 'guard_name' => $guardName]);
    }

    // super admin

    public function isSuperAdmin(?User $user)
    {
        if (! $user instanceof User) {
            return false;
        }

        return $user->hasAnyRole([$this->getSuperAdminRoleName()]);
    }

    public function getSuperAdminUser(): User
    {
        $cacheKey = 'RbacService::getSuperAdminUser';

        return Cache::remember($cacheKey, 3600, function () {
            $nationalCodes = $this->getSuperAdminNationalCodes();
            $user = User::query()->whereIn('national_code', $nationalCodes)->first();
            abort_unless($user, 500, 'cant find SUPER_ADMIN_NATIONAL_CODE in `users` table');

            return $user;
        });
    }

    public function getSuperAdminNationalCodes(): array
    {
        $stringNationalCodes = (string) config('permission.super_admin_national_codes');
        $nationalCodes = array_values(array_filter(array_map('trim', explode(',', $stringNationalCodes))));
        abort_unless($nationalCodes, 500, 'set SUPER_ADMIN_NATIONAL_CODES in env');

        return $nationalCodes;
    }

    public function getSuperAdminRoleName()
    {
        $superAdminRole = config('permission.super_admin_role_name');
        abort_unless($superAdminRole, 500, 'set SUPER_ADMIN_ROLE_NAME in env');

        return $superAdminRole;
    }
}
