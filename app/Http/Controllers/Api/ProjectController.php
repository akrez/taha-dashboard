<?php

namespace App\Http\Controllers\Api;

use App\Enums\ActivityStatusEnum;
use App\Enums\CivilStatusEnum;
use App\Enums\ProvinceEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Project\StoreProjectRequest;
use App\Http\Requests\Api\Project\UpdateProjectRequest;
use App\Http\Requests\Api\Project\UpdateProjectSystemStatusRequest;
use App\Http\Resources\Api\Project\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(ProjectService $projects): JsonResponse
    {
        return ProjectResource::collection($projects->index())->response();
    }

    /**
     * Choices for the project form.
     */
    public function options(ProjectService $projects): JsonResponse
    {
        return response()->json([
            'employers' => $projects->options()->map(fn ($employer) => [
                'id' => $employer->id,
                'name' => $employer->name,
                'is_active' => $employer->is_active,
            ])->values(),
            'civil_statuses' => CivilStatusEnum::collection(),
            'activity_statuses' => ActivityStatusEnum::collection(),
            'provinces' => ProvinceEnum::collection(),
        ]);
    }

    public function store(StoreProjectRequest $request, ProjectService $projects): JsonResponse
    {
        $project = $projects->create($request->validated());

        return (new ProjectResource($project->load('employer')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateProjectRequest $request, Project $project, ProjectService $projects): JsonResponse
    {
        $projects->update($project, $request->validated());

        return (new ProjectResource($project->load('employer')))->response();
    }

    /**
     * تغییر سریع وضعیت پروژه در سیستم از صفحه فهرست، بدون ارسال کل اطلاعات پروژه.
     */
    public function updateSystemStatus(
        UpdateProjectSystemStatusRequest $request,
        Project $project,
        ProjectService $projects,
    ): JsonResponse {
        $projects->updateSystemStatus($project, $request->boolean('is_active'));

        return (new ProjectResource($project->load('employer')))->response();
    }
}
