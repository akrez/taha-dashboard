<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Link\LinkResource;
use App\Http\Resources\Api\Slide\SlideResource;
use App\Services\LinkService;
use App\Services\SlideService;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function __construct(
        protected SlideService $slideService,
        protected VisitService $visitService,
        protected LinkService $linkService,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'visits' =>  $this->visitService->stats(),
            'slides' => SlideResource::collection($this->slideService->visible()),
            'links' => LinkResource::collection($this->linkService->visible()),
            'date' => [
                'jalali' => verta()->now()->format('l j F Y'),
                'gregorian' => now()->format('l j F Y'),
            ],
        ]);
    }
}
