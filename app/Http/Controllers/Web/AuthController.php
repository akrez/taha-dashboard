<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Redirect direct visits to /login to the SPA with the login modal triggered.
     */
    public function login(Request $request): RedirectResponse
    {
        $redirect = $request->query('redirect');
        $query = $redirect ? '?login=1&redirect=' . urlencode($redirect) : '?login=1';

        return redirect('/' . $query);
    }
}
