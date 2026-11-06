<?php

namespace App\Services;

use App\Models\Employer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    /**
     * Every project with its employer and manager, for the management screen.
     */
    public function index(): Collection
    {
        return Project::query()
            ->with(['employer', 'manager'])
            ->orderBy('name')
            ->orderBy('id')
            ->get();
    }

    /**
     * Choices used by the project form.
     *
     * @return array{employers: Collection<int, Employer>, users: Collection<int, User>}
     */
    public function options(): array
    {
        return [
            'employers' => Employer::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'users' => User::query()
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name']),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Project
    {
        return Project::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Project $project, array $data): Project
    {
        $project->update($data);

        return $project;
    }

    public function delete(Project $project): void
    {
        if ($project->users()->exists()) {
            abort(422, 'این پروژه به کاربران تخصیص داده شده است؛ ابتدا کاربران را از پروژه خارج کنید.');
        }

        $project->delete();
    }
}
