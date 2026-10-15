<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Guard;

class UserService
{
    public static function new(): self
    {
        return app(self::class);
    }

    /**
     * Create (or update) the super admin user for the given national code
     * and assign it the configured super admin role.
     */
    public function createSuperAdmin(string $nationalCode, string $password): User
    {
        $user = User::query()->updateOrCreate(
            ['national_code' => $nationalCode],
            ['password' => $password],
        );

        $rbac = RbacService::new();

        $role = $rbac->findOrCreateRole(
            $rbac->getSuperAdminRoleName()
        );

        $rbac->syncUserRoles($user, [$role]);

        return $user;
    }
}
