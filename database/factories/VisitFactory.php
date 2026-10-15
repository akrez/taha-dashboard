<?php

namespace Database\Factories;

use App\Models\Visit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Visit>
 */
class VisitFactory extends Factory
{
    protected $model = Visit::class;

    public function definition(): array
    {
        $now = verta()->now();

        return [
            'user_id' => User::factory(),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'jdate' => $now->format('YmdHis'),
            'jyear' => $now->year,
            'jmonth' => $now->month,
            'jday' => $now->day,
            'jhour' => $now->hour,
            'visited_at' => now(),
        ];
    }
}
