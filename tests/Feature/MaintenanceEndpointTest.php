<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class MaintenanceEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.maintenance_token' => 'test-maintenance-token']);

        Artisan::shouldReceive('call')->andReturn(0);
        Artisan::shouldReceive('output')->andReturn('ok');
    }

    public function test_endpoint_rejects_request_without_token(): void
    {
        $this->getJson('/api/maintenance')->assertUnauthorized();
    }

    public function test_endpoint_rejects_invalid_token(): void
    {
        $this->getJson('/api/maintenance?token=wrong-token')->assertUnauthorized();
    }

    public function test_endpoint_runs_with_valid_query_token(): void
    {
        $this->getJson('/api/maintenance?token=test-maintenance-token')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('results.migrate.success', true)
            ->assertJsonPath('results.seed_permissions.success', true)
            ->assertJsonPath('results.optimize.success', true);
    }

    public function test_endpoint_accepts_header_token(): void
    {
        $this->getJson('/api/maintenance', [
            'X-Maintenance-Token' => 'test-maintenance-token',
        ])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_endpoint_accepts_bearer_token(): void
    {
        $this->getJson('/api/maintenance', [
            'Authorization' => 'Bearer test-maintenance-token',
        ])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_endpoint_is_disabled_when_token_is_empty(): void
    {
        config(['app.maintenance_token' => '']);

        $this->getJson('/api/maintenance?token=anything')->assertNotFound();
    }
}
