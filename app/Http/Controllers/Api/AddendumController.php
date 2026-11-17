<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Project\StoreAddendumRequest;
use App\Http\Requests\Api\Project\UpdateAddendumRequest;
use App\Http\Resources\Api\Project\AddendumResource;
use App\Models\Addendum;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class AddendumController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        return AddendumResource::collection(
            $project->addenda()->orderBy('number')->get(),
        )->response();
    }

    public function store(StoreAddendumRequest $request, Project $project): JsonResponse
    {
        $addendum = $project->addenda()->create($request->validated());

        return (new AddendumResource($addendum))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateAddendumRequest $request, Addendum $addendum): JsonResponse
    {
        $addendum->update($request->validated());

        return (new AddendumResource($addendum))->response();
    }

    public function destroy(Addendum $addendum): JsonResponse
    {
        $addendum->delete();

        return response()->json(['message' => 'الحاقیه حذف شد.']);
    }
}
