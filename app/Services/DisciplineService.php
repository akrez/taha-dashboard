<?php

namespace App\Services;

use App\Models\Discipline;

class DisciplineService
{
    public function create(string $name): Discipline
    {
        return Discipline::query()->firstOrCreate(['name' => $name]);
    }
}
