<?php

namespace App\Services;

use App\Models\Employer;
use Illuminate\Database\Eloquent\Collection;

class EmployerService
{
    /**
     * Every employer, in alphabetical order, for the management screen.
     */
    public function index(): Collection
    {
        return Employer::query()
            ->withCount('projects')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Employer
    {
        return Employer::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Employer $employer, array $data): Employer
    {
        $employer->update($data);

        return $employer;
    }
}
