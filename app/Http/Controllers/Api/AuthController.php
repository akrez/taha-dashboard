<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate by national code + password and issue an API token.
     */
    public function login(Request $request, RbacService $rbac): JsonResponse
    {
        $credentials = $request->validate([
            'national_code' => ['required', 'string', 'digits:10'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('national_code', $credentials['national_code'])
            ->where('is_disable', false)
            ->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
        } else {
            throw ValidationException::withMessages([
                'national_code' => 'کد ملی یا رمز عبور اشتباه است.',
            ]);
        }

        $user->load(['position', 'project']);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user,
            'permissions' => $user->getAllPermissions()->pluck('name')->values(),
            'roles' => $user->getRoleNames()->values(),
            'is_super_admin' => $rbac->isSuperAdmin($user),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the token used for the current request.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'logged out']);
    }
}
