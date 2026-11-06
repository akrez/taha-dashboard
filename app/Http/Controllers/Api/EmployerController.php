<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Employer\StoreEmployerRequest;
use App\Http\Requests\Api\Employer\UpdateEmployerRequest;
use App\Http\Resources\Api\Employer\EmployerResource;
use App\Models\Employer;
use App\Services\EmployerService;
use Illuminate\Http\JsonResponse;

class EmployerController extends Controller
{
    public function index(EmployerService $employers): JsonResponse
    {
        return EmployerResource::collection($employers->index())->response();
    }

    public function store(StoreEmployerRequest $request, EmployerService $employers): JsonResponse
    {
        $employer = $employers->create($request->validated());

        return (new EmployerResource($employer))->response()->setStatusCode(201);
    }

    public function update(UpdateEmployerRequest $request, Employer $employer, EmployerService $employers): JsonResponse
    {
        $employers->update($employer, $request->validated());

        return (new EmployerResource($employer))->response();
    }
}
