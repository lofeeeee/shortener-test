<?php

namespace App\Http\Controllers\Api;

use App\Data\Auth\LoginData;
use App\Data\Auth\RegisterData;
use App\Data\UserData;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterData $data): JsonResponse
    {
        $user = User::create([
            'username' => $data->username,
            'display_name' => $data->display_name,
            'email' => $data->email,
            'password' => $data->password,
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => UserData::fromModel($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginData $data): JsonResponse
    {
        $field = str_contains($data->login, '@') ? 'email' : 'username';

        if (!Auth::attempt([$field => $data->login, 'password' => $data->password])) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        /** @var User $user */
        $user = User::where($field, $data->login)->first();

        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Account is deactivated.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => UserData::fromModel($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => UserData::fromModel($request->user())]);
    }
}