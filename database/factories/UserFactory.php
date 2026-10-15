<?php

namespace Database\Factories;

use App\Models\Discipline;
use App\Models\Position;
use App\Models\Project;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'personnel_code' => fake()->unique()->numerify('##########'),
            'national_code' => fake()->unique()->numerify('##########'),
            'first_name' => fake()->randomElement(['حسن', 'رضا', 'علی', 'محمد', 'حسین', 'مهدی', 'سارا', 'زهرا', 'فاطمه', 'مریم']),
            'last_name' => fake()->randomElement(['حسنی', 'رضایی', 'محمدی', 'حسینی', 'کریمی', 'موسوی', 'احمدی', 'صادقی']),
            'father_name' => fake()->randomElement(['محسن', 'اکبر', 'اصغر', 'جعفر', 'قاسم', 'ناصر']),
            'discipline_id' => Discipline::factory(),
            'project_id' => Project::factory(),
            'section_id' => Section::factory(),
            'position_id' => Position::factory(),
            'membership_type' => fake()->randomElement(['قراردادی', 'رسمی', 'پیمانی']),
            'is_disable' => false,
            'password' => static::$password ??= Hash::make('password'),
        ];
    }

    /**
     * Indicate that the user is disabled.
     */
    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_disable' => true,
        ]);
    }
}
