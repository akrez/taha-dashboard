<?php

namespace App\Services;

use App\Models\Section;

class SectionService
{
    public function create(string $name): Section
    {
        return Section::query()->firstOrCreate(['name' => $name]);
    }
}
