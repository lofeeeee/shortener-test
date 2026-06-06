<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class BioController extends Controller
{
    public function show(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->where('is_active', true)
            ->first(['id', 'username', 'display_name', 'created_at']);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $links = Link::where('created_by', $user->id)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->whereNull('password')
            ->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>', now());
            })
            ->select(['unique_id', 'title', 'link_target', 'passed', 'created_at'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => [
                'username'    => $user->username,
                'display_name' => $user->display_name,
                'member_since' => $user->created_at->format('Y'),
                'link_count'  => $links->count(),
                'links'       => $links->map(fn ($link) => [
                    'unique_id' => $link->unique_id,
                    'title'     => $link->title ?? $link->link_target,
                    'short_url' => config('app.url') . '/' . $link->unique_id,
                    'clicks'    => $link->passed,
                ])->values()->all(),
            ],
        ]);
    }
}
