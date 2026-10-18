<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Slide\StoreSlideRequest;
use App\Http\Requests\Api\Slide\UpdateSlideRequest;
use App\Http\Resources\Api\Slide\SlideResource;
use App\Models\Slide;
use App\Services\SlideService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class SlideController extends Controller
{
    public function index(SlideService $slides): JsonResponse
    {
        return SlideResource::collection($slides->index())->response();
    }

    public function store(StoreSlideRequest $request, SlideService $slides): JsonResponse
    {
        $slide = $slides->create(
            Arr::except($request->validated(), ['image']),
            $request->file('image'),
            $request->user()->id,
        );

        return (new SlideResource($slide->load('file')))->response()->setStatusCode(201);
    }

    public function update(UpdateSlideRequest $request, Slide $slide, SlideService $slides): JsonResponse
    {
        $slides->update(
            $slide,
            Arr::except($request->validated(), ['image']),
            $request->file('image'),
        );

        return (new SlideResource($slide->load('file')))->response();
    }

    public function destroy(Slide $slide, SlideService $slides): JsonResponse
    {
        $slides->delete($slide);

        return response()->json(['message' => 'اسلاید حذف شد.']);
    }
}
