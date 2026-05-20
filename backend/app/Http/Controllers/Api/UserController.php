<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private HashIdService $hashId) {}

    public function show(Request $request, string $hashedId): JsonResponse
    {
        $user = $this->resolveUser($hashedId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Users may only view their own profile unless they are viewing a public profile
        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => new UserResource($user)]);
    }

    public function update(UpdateUserRequest $request, string $hashedId): JsonResponse
    {
        $user = $this->resolveUser($hashedId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // username is intentionally excluded — it cannot be changed after registration
        $user->update($request->only(['display_name', 'email', 'password', 'is_active']));

        return response()->json(['data' => new UserResource($user)]);
    }

    public function destroy(Request $request, string $hashedId): JsonResponse
    {
        $user = $this->resolveUser($hashedId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $user->update(['is_active' => false]);

        // Revoke all tokens so they can no longer authenticate
        $user->tokens()->delete();

        return response()->json(['message' => 'Account deactivated successfully.']);
    }

    private function resolveUser(string $hashedId): ?User
    {
        $id = $this->hashId->decode($hashedId);

        return $id ? User::find($id) : null;
    }
}
