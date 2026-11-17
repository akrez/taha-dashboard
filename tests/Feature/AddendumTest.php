<?php

namespace Tests\Feature;

use App\Enums\PermissionEnum;
use App\Models\Project;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddendumTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        $permission = RbacService::new()->findOrCreatePermission(PermissionEnum::Project->name);

        $this->user = User::factory()->create();
        $this->user->givePermissionTo($permission);

        Sanctum::actingAs($this->user, [], 'api');

        $this->project = Project::factory()->create();
    }

    public function test_addendum_can_be_created_for_a_project()
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/addenda", [
            'number' => 1,
            'duration' => 6,
            'amount_rials' => 1500000,
            'amount_currency' => 2000,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.number', 1);
        $response->assertJsonPath('data.duration', 6);

        $this->assertDatabaseHas('addenda', [
            'project_id' => $this->project->id,
            'number' => 1,
            'duration' => 6,
        ]);
    }

    public function test_addendum_amount_rejects_decimals()
    {
        $this->postJson("/api/projects/{$this->project->id}/addenda", [
            'number' => 1,
            'amount_rials' => 1500.5,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('amount_rials');
    }

    public function test_addendum_supports_large_rial_amounts()
    {
        $response = $this->postJson("/api/projects/{$this->project->id}/addenda", [
            'number' => 1,
            'amount_rials' => 999000000000000,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.amount_rials', 999000000000000);

        $this->assertDatabaseHas('addenda', [
            'project_id' => $this->project->id,
            'number' => 1,
        ]);
    }

    public function test_addendum_number_is_unique_per_project()
    {
        $this->project->addenda()->create(['number' => 1]);

        $this->postJson("/api/projects/{$this->project->id}/addenda", [
            'number' => 1,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('number');

        $otherProject = Project::factory()->create();

        $this->postJson("/api/projects/{$otherProject->id}/addenda", [
            'number' => 1,
        ])->assertCreated();
    }

    public function test_addendum_can_be_updated_and_deleted()
    {
        $addendum = $this->project->addenda()->create([
            'number' => 1,
            'duration' => 3,
        ]);

        $this->putJson("/api/addenda/{$addendum->id}", [
            'number' => 2,
            'duration' => 9,
            'amount_rials' => 100,
        ])->assertOk()
            ->assertJsonPath('data.number', 2)
            ->assertJsonPath('data.duration', 9);

        $this->assertDatabaseHas('addenda', [
            'id' => $addendum->id,
            'number' => 2,
            'duration' => 9,
        ]);

        $this->deleteJson("/api/addenda/{$addendum->id}")->assertOk();

        $this->assertDatabaseMissing('addenda', ['id' => $addendum->id]);
    }

    public function test_addenda_are_listed_for_the_project()
    {
        $this->project->addenda()->create(['number' => 2]);
        $this->project->addenda()->create(['number' => 1]);

        $response = $this->getJson("/api/projects/{$this->project->id}/addenda");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $response->assertJsonPath('data.0.number', 1);
        $response->assertJsonPath('data.1.number', 2);
    }
}
