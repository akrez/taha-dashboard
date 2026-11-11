<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class MaintenanceEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'permission.super_admin_role_name' => 'SUPER_ADMIN',
            'permission.super_admin_national_codes' => '9999999999',
        ]);

        Artisan::shouldReceive('call')->andReturn(0);
        Artisan::shouldReceive('output')->andReturn('ok');
    }

    private function makeUser(string $nationalCode = '1111111111'): User
    {
        return User::create([
            'national_code' => $nationalCode,
            'password' => 'password',
            'is_disable' => false,
        ]);
    }

    private function makeSuperAdmin(): User
    {
        $user = $this->makeUser('9999999999');
        $user->assignRole(Role::findOrCreate('SUPER_ADMIN', 'api'));

        return $user;
    }

    public function test_endpoint_requires_authentication(): void
    {
        $this->postJson('/api/maintenance')->assertUnauthorized();
    }

    public function test_endpoint_forbids_non_super_admin_users(): void
    {
        $this->actingAs($this->makeUser(), 'api')
            ->postJson('/api/maintenance')
            ->assertForbidden();
    }

    public function test_super_admin_can_run_maintenance(): void
    {
        $this->actingAs($this->makeSuperAdmin(), 'api')
            ->postJson('/api/maintenance')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('results.migrate.success', true)
            ->assertJsonPath('results.seed_permissions.success', true)
            ->assertJsonPath('results.optimize.success', true);
    }
}
