<?php

namespace Database\Factories;

use App\Enums\ActivityStatusEnum;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'internal_code' => str_pad(
                (string) fake()->unique()->numberBetween(1, 99999999),
                8,
                '0',
                STR_PAD_LEFT,
            ),
            'project_name' => fake()->unique()->words(3, true),
            'contract_number' => fake()->unique()->numerify('CT-#####'),
            'activity_status' => ActivityStatusEnum::Active,
            'is_active' => true,
        ];
    }
}
