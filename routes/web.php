<?php

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::get('/', [HomeController::class, 'index']);

// Serve the dashboard shell for client-side routes (e.g. /visits, /roles) so
// deep links and refreshes reach the React router instead of a 404.
Route::get('/{path}', [HomeController::class, 'index'])
    ->where('path', '(?!api/|build/|storage/|vendor/|_ignition/).*')
    ->name('spa');
