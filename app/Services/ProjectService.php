<?php

namespace App\Services;

use App\Models\Employer;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    /**
     * Every project with its employer, for the management screen.
     */
    public function index(): Collection
    {
        return Project::query()
            ->with('employer')
            ->orderBy('project_name')
            ->orderBy('id')
            ->get();
    }

    /**
     * Employers used by the project form.
     *
     * @return Collection<int, Employer>
     */
    public function options(): Collection
    {
        return Employer::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'is_active']);
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

    /**
     * وضعیت پروژه در سیستم (فعال/غیرفعال) را بدون ارسال کل اطلاعات تغییر می‌دهد.
     */
    public function updateSystemStatus(Project $project, bool $isActive): Project
    {
        $project->update(['is_active' => $isActive]);

        return $project;
    }
}
