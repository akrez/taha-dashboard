<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    /**
     * Today's date in both the Jalali and Gregorian calendars, used by the
     * dashboard app bar.
     */
    public function date(): JsonResponse
    {
        return response()->json([
            'jalali' => verta()->now()->format('l j F Y'),
            'gregorian' => now()->format('l j F Y'),
        ]);
    }
}
