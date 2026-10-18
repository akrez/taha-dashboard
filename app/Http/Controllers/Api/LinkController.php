<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Link\StoreLinkRequest;
use App\Http\Requests\Api\Link\UpdateLinkRequest;
use App\Http\Resources\Api\Link\LinkResource;
use App\Models\Link;
use App\Services\LinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;

class LinkController extends Controller
{
    public function index(LinkService $links): JsonResponse
    {
        return LinkResource::collection($links->index())->response();
    }

    public function store(StoreLinkRequest $request, LinkService $links): JsonResponse
    {
        $link = $links->create(
            Arr::except($request->validated(), ['file']),
            $request->file('file'),
            $request->user()->id,
        );

        return (new LinkResource($link->load('file')))->response()->setStatusCode(201);
    }

    public function update(UpdateLinkRequest $request, Link $link, LinkService $links): JsonResponse
    {
        $links->update(
            $link,
            Arr::except($request->validated(), ['file']),
            $request->file('file'),
        );

        return (new LinkResource($link->load('file')))->response();
    }

    public function destroy(Link $link, LinkService $links): JsonResponse
    {
        $links->delete($link);

        return response()->json(['message' => 'لینک حذف شد.']);
    }
}
