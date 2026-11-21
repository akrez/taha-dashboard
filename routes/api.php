<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\Api\AddendumController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmployerController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\MyPayslipController;
use App\Http\Controllers\Api\PayslipUploadController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SlideController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VisitController;
use App\Services\RbacService;
use Illuminate\Support\Facades\Route;

$permission = fn (PermissionEnum $permission): string => 'permission:'.$permission->name;
$superAdmin = 'role:'.RbacService::superAdminRoleName();

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () use ($permission, $superAdmin) {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/visits', [VisitController::class, 'index'])->middleware($permission(PermissionEnum::VisitIndex));

    Route::prefix('slides')->middleware($permission(PermissionEnum::Slide))->controller(SlideController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{slide}', 'update');
        Route::delete('/{slide}', 'destroy');
    });

    Route::prefix('links')->middleware($permission(PermissionEnum::Link))->controller(LinkController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{link}', 'update');
        Route::delete('/{link}', 'destroy');
    });

    Route::prefix('employers')->middleware($permission(PermissionEnum::Employer))->controller(EmployerController::class)->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{employer}', 'update');
    });

    Route::middleware($permission(PermissionEnum::Project))->group(function () {
        Route::controller(ProjectController::class)->group(function () {
            Route::get('/projects', 'index');
            Route::get('/projects/options', 'options');
            Route::get('/projects/{project}', 'show');
            Route::post('/projects', 'store');
            Route::put('/projects/{project}', 'update');
            Route::patch('/projects/{project}/system-status', 'updateSystemStatus');
        });

        Route::controller(AddendumController::class)->group(function () {
            Route::get('/projects/{project}/addenda', 'index');
            Route::post('/projects/{project}/addenda', 'store');
            Route::put('/addenda/{addendum}', 'update');
            Route::delete('/addenda/{addendum}', 'destroy');
        });
    });

    Route::middleware($superAdmin)->group(function () {
        Route::post('/maintenance', MaintenanceController::class)->middleware('throttle:5,1');

        Route::prefix('roles')->controller(RoleController::class)->group(function () {
            Route::get('/permissions', 'permissions');
            Route::get('/users', 'users');
            Route::get('/', 'index');
            Route::post('/', 'create');
            Route::put('/{role}', 'update');
            Route::put('/{role}/permissions', 'syncPermissions');
            Route::put('/{role}/users', 'syncUsers');
        });
    });

    Route::prefix('users')->group(function () use ($permission) {
        Route::post('/import', [UserController::class, 'import'])->middleware($permission(PermissionEnum::UserManager));

        Route::middleware($permission(PermissionEnum::UserIndex))->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/export', [UserController::class, 'export']);
        });
    });

    Route::prefix('payslips')->group(function () use ($permission) {
        Route::middleware($permission(PermissionEnum::Payslip))->group(function () {
            Route::get('/uploads', [PayslipUploadController::class, 'index']);
            Route::post('/uploads', [PayslipUploadController::class, 'store']);
            Route::get('/uploads/{upload}', [PayslipUploadController::class, 'show']);
            Route::patch('/uploads/{upload}/status', [PayslipUploadController::class, 'updateStatus']);
            Route::get('/uploads/{upload}/payslips/{payslip}', [PayslipUploadController::class, 'showPayslip']);
        });

        Route::prefix('mine')->controller(MyPayslipController::class)->group(function () {
            Route::get('/', 'index');
            Route::get('/{payslip}', 'show');
        });
    });
});

Route::get('/', [HomeController::class, 'index']);
