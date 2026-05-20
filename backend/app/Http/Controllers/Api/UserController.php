<?php

namespace App\Http\Controllers\Api;

use App\Data\User\UpdateUserData;
use App\Data\UserData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\LaravelData\Optional;

class UserController extends Controller
{
    public function __construct(private HashIdService $hashId) {}

    public function show(Request $request, string $hashedId): JsonResponse
    {
        $user = $this->resolveUser($hashedId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['data' => UserData::fromModel($user)]);
    }

    public function update(UpdateUserData $data, string $hashedId): JsonResponse
    {
        $user = $this->resolveUser($hashedId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (auth()->id() !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // toArray() automatically excludes Optional fields that were not sent in the request
        // username is intentionally absent from UpdateUserData — it cannot be changed
        $user->update($data->toArray());

        return response()->json(['data' => UserData::fromModel($user->fresh())]);
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
        $user->tokens()->delete();

        return response()->json(['message' => 'Account deactivated successfully.']);
    }

    private function resolveUser(string $hashedId): ?User
    {
        $id = $this->hashId->decode($hashedId);

        return $id ? User::find($id) : null;
    }
}
