<?php

namespace App\Console\Commands;

use App\Enums\PermissionEnum;
use App\Services\RbacService;
use Illuminate\Console\Command;

class SeedPermissionsCommand extends Command
{
    protected $signature = 'app:seed-permissions';

    protected $description = 'Generate permissions records';

    public function handle(): void
    {
        $rbac = RbacService::new();

        $permissions = [];
        foreach (PermissionEnum::names() as $permissionName) {
            $permissions[] = $rbac->findOrCreatePermission($permissionName);
        }

        $this->info("Done!");
    }
}
