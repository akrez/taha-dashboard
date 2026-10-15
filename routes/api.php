<?php

use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\VisitController;
use Illuminate\Support\Facades\Route;

Route::get('/visits/stats', [VisitController::class, 'stats']);
