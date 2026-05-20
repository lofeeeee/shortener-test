<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Link\CreateLinkRequest;
use App\Http\Requests\Link\UpdateLinkRequest;
use App\Http\Resources\LinkResource;
use App\Models\Link;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkController extends Controller
{
    public function __construct(private HashIdService $hashId) {}

    public function index(Request $request): JsonResponse
    {
        $query = Link::where('created_by', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if (!$request->boolean('include_deleted')) {
            $query->where('is_active', true);
        }

        if ($request->boolean('include_expired')) {
            // show expired links too
        } else {
            // exclude links where valid_until has passed
            $query->where(function ($q) {
                $q->whereNull('valid_until')
                    ->orWhere('valid_until', '>', now());
            });
        }

        $links = $query->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'data' => LinkResource::collection($links->items()),
            'meta' => [
                'current_page' => $links->currentPage(),
                'last_page' => $links->lastPage(),
                'per_page' => $links->perPage(),
                'total' => $links->total(),
            ],
        ]);
    }

    public function store(CreateLinkRequest $request): JsonResponse
    {
        $link = Link::create([
            'unique_id' => $this->generateUniqueId(),
            'link_target' => $request->link_target,
            'passed' => 0,
            'is_active' => true,
            'valid_until' => $request->valid_until ?? null,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => new LinkResource($link)], 201);
    }

    public function show(Request $request, string $hashedId): JsonResponse
    {
        $link = $this->resolveLink($hashedId, $request->user()->id);

        if (!$link) {
            return response()->json(['message' => 'Link not found.'], 404);
        }

        return response()->json(['data' => new LinkResource($link)]);
    }

    public function update(UpdateLinkRequest $request, string $hashedId): JsonResponse
    {
        $link = $this->resolveLink($hashedId, $request->user()->id);

        if (!$link) {
            return response()->json(['message' => 'Link not found.'], 404);
        }

        $link->update($request->only(['link_target', 'is_active', 'valid_until']));

        return response()->json(['data' => new LinkResource($link)]);
    }

    public function destroy(Request $request, string $hashedId): JsonResponse
    {
        $link = $this->resolveLink($hashedId, $request->user()->id);

        if (!$link) {
            return response()->json(['message' => 'Link not found.'], 404);
        }

        if (!$link->is_active) {
            return response()->json(['message' => 'Link is already deleted.'], 409);
        }

        $link->update([
            'is_active' => false,
            'deleted_at' => now(),
            'deleted_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Link deleted successfully.']);
    }

    private function resolveLink(string $hashedId, int $userId): ?Link
    {
        $id = $this->hashId->decode($hashedId);

        if (!$id) {
            return null;
        }

        return Link::where('id', $id)
            ->where('created_by', $userId)
            ->first();
    }

    private function generateUniqueId(int $length = 7): string
    {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        do {
            $uniqueId = '';
            for ($i = 0; $i < $length; $i++) {
                $uniqueId .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (Link::where('unique_id', $uniqueId)->exists());

        return $uniqueId;
    }
}
