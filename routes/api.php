<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SlideController;
use App\Http\Controllers\Api\VisitController;
use App\Services\RbacService;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::middleware(['permission:'.PermissionEnum::VisitIndex->name])->group(function () {
        Route::get('/visits', [VisitController::class, 'index']);
    });
    Route::middleware(['permission:'.PermissionEnum::Slide->name])->group(function () {
        Route::get('/slides', [SlideController::class, 'index']);
        Route::post('/slides', [SlideController::class, 'store']);
        Route::put('/slides/{slide}', [SlideController::class, 'update']);
        Route::delete('/slides/{slide}', [SlideController::class, 'destroy']);
    });
    Route::middleware(['permission:'.PermissionEnum::Link->name])->group(function () {
        Route::get('/links', [LinkController::class, 'index']);
        Route::post('/links', [LinkController::class, 'store']);
        Route::put('/links/{link}', [LinkController::class, 'update']);
        Route::delete('/links/{link}', [LinkController::class, 'destroy']);
    });
    Route::middleware(['role:'.RbacService::superAdminRoleName()])->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/permissions', [RoleController::class, 'permissions']);
        Route::get('/roles/users', [RoleController::class, 'users']);
        Route::post('/roles', [RoleController::class, 'create']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
        Route::put('/roles/{role}/users', [RoleController::class, 'syncUsers']);
    });
});

Route::get('/', [HomeController::class, 'index']);
