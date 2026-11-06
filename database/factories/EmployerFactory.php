<?php

namespace Database\Factories;

use App\Models\Employer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Employer>
 */
class EmployerFactory extends Factory
{
    protected $model = Employer::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'representative_name' => fake()->name(),
            'address' => fake()->address(),
            'phone' => fake()->numerify('021########'),
        ];
    }
}
