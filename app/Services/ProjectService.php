<?php

namespace App\Services;

use App\Models\Project;

class ProjectService
{
    public function create(string $name): Project
    {
        return Project::query()->firstOrCreate(['name' => $name]);
    }
}
