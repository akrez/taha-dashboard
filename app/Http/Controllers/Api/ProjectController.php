<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Project\StoreProjectRequest;
use App\Http\Requests\Api\Project\UpdateProjectRequest;
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
     * Choices for the project form (employers and project managers).
     */
    public function options(ProjectService $projects): JsonResponse
    {
        $options = $projects->options();

        return response()->json([
            'employers' => $options['employers']->map(fn ($employer) => [
                'id' => $employer->id,
                'name' => $employer->name,
            ])->values(),
            'users' => $options['users']->map(fn ($user) => [
                'id' => $user->id,
                'name' => trim($user->first_name.' '.$user->last_name),
            ])->values(),
        ]);
    }

    public function store(StoreProjectRequest $request, ProjectService $projects): JsonResponse
    {
        $project = $projects->create($request->validated());

        return (new ProjectResource($project->load(['employer', 'manager'])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateProjectRequest $request, Project $project, ProjectService $projects): JsonResponse
    {
        $projects->update($project, $request->validated());

        return (new ProjectResource($project->load(['employer', 'manager'])))->response();
    }

    public function destroy(Project $project, ProjectService $projects): JsonResponse
    {
        $projects->delete($project);

        return response()->json(['message' => 'پروژه حذف شد.']);
    }
}
