<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;

class VisitController extends Controller
{
    public function stats(VisitService $visits): JsonResponse
    {
        return response()->json($visits->stats());
    }
}
