<?php

namespace Tests\Feature;

use App\Enums\ActivityStatusEnum;
use App\Enums\PermissionEnum;
use App\Enums\ProvinceEnum;
use App\Models\Project;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectProvinceTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $permission = RbacService::new()->findOrCreatePermission(PermissionEnum::Project->name);

        $this->user = User::factory()->create();
        $this->user->givePermissionTo($permission);

        Sanctum::actingAs($this->user, [], 'api');
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(array $overrides = []): array
    {
        return array_merge([
            'internal_code' => '10001234',
            'project_name' => 'پروژه آزمایشی',
            'contract_number' => 'CT-1001',
            'activity_status' => ActivityStatusEnum::Active->name,
        ], $overrides);
    }

    public function test_project_is_stored_with_province_enum_name()
    {
        $response = $this->postJson('/api/projects', $this->payload([
            'province' => ProvinceEnum::TEHRAN->name,
        ]));

        $response->assertCreated();

        $project = Project::where('internal_code', '10001234')->firstOrFail();

        $this->assertSame(ProvinceEnum::TEHRAN->name, $project->getRawOriginal('province'));
        $this->assertInstanceOf(ProvinceEnum::class, $project->province);
        $this->assertSame(ProvinceEnum::TEHRAN, $project->province);

        $response->assertJsonPath('data.province', ProvinceEnum::TEHRAN->name);
        $response->assertJsonPath('data.province_trans', 'تهران');
    }

    public function test_project_province_can_be_updated()
    {
        $project = Project::factory()->create([
            'internal_code' => '10001234',
            'province' => ProvinceEnum::TEHRAN->name,
        ]);

        $response = $this->putJson("/api/projects/{$project->id}", $this->payload([
            'province' => ProvinceEnum::ESFAHAN->name,
        ]));

        $response->assertOk();

        $project->refresh();

        $this->assertSame(ProvinceEnum::ESFAHAN->name, $project->getRawOriginal('province'));

        $response->assertJsonPath('data.province', ProvinceEnum::ESFAHAN->name);
        $response->assertJsonPath('data.province_trans', 'اصفهان');
    }

    public function test_unknown_province_is_rejected()
    {
        $response = $this->postJson('/api/projects', $this->payload([
            'province' => 'استان ناموجود',
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('province');
    }

    public function test_options_endpoint_returns_provinces_with_persian_labels()
    {
        $response = $this->getJson('/api/projects/options');

        $response->assertOk();

        $provinces = $response->json('provinces');

        $this->assertCount(count(ProvinceEnum::cases()), $provinces);
        $this->assertSame(
            ['name' => 'ALBORZ', 'trans' => 'البرز'],
            $provinces[0],
        );
    }
}
