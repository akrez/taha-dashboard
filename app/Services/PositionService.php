<?php

namespace App\Services;

use App\Models\Position;

class PositionService
{
    public function create(string $name): Position
    {
        return Position::query()->firstOrCreate(['name' => $name]);
    }
}
