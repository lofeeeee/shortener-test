<?php

namespace App\Http\Controllers\Api;

use App\Data\LinkData;
use App\Data\UserData;
use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\LinkClick;
use App\Models\User;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private HashIdService $hashIds) {}

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'total_users'   => User::count(),
                'total_links'   => Link::count(),
                'active_links'  => Link::where('is_active', true)->whereNull('deleted_at')->count(),
                'total_clicks'  => LinkClick::count(),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query()->orderBy('created_at', 'desc');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'data' => $users->map(fn (User $u) => UserData::fromModel($u)),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function updateUser(Request $request, string $hashedId): JsonResponse
    {
        $id = $this->hashIds->decode($hashedId);
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $allowed = $request->only(['is_active', 'can_custom_slug', 'is_admin']);
        $user->update($allowed);

        return response()->json(['data' => UserData::fromModel($user->fresh())]);
    }

    public function links(Request $request): JsonResponse
    {
        $query = Link::with('creator')->orderBy('created_at', 'desc');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('unique_id', 'like', "%{$search}%")
                  ->orWhere('link_target', 'like', "%{$search}%");
            });
        }

        $links = $query->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'data' => $links->map(fn (Link $l) => LinkData::fromModel($l)),
            'meta' => [
                'current_page' => $links->currentPage(),
                'last_page'    => $links->lastPage(),
                'per_page'     => $links->perPage(),
                'total'        => $links->total(),
            ],
        ]);
    }
}
