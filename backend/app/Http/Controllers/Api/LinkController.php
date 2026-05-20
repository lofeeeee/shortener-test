<?php

namespace App\Http\Controllers\Api;

use App\Data\Link\CreateLinkData;
use App\Data\Link\UpdateLinkData;
use App\Data\LinkData;
use App\Http\Controllers\Controller;
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

        if (!$request->boolean('include_expired')) {
            $query->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>', now());
            });
        }

        $links = $query->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'data' => $links->map(fn (Link $link) => LinkData::fromModel($link)),
            'meta' => [
                'current_page' => $links->currentPage(),
                'last_page' => $links->lastPage(),
                'per_page' => $links->perPage(),
                'total' => $links->total(),
            ],
        ]);
    }

    public function store(CreateLinkData $data, Request $request): JsonResponse
    {
        $link = Link::create([
            ...$data->toArray(),
            'unique_id' => $this->generateUniqueId(),
            'passed' => 0,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['data' => LinkData::fromModel($link)], 201);
    }

    public function show(Request $request, string $hashedId): JsonResponse
    {
        $link = $this->resolveLink($hashedId, $request->user()->id);

        if (!$link) {
            return response()->json(['message' => 'Link not found.'], 404);
        }

        return response()->json(['data' => LinkData::fromModel($link)]);
    }

    public function update(UpdateLinkData $data, string $hashedId): JsonResponse
    {
        $link = $this->resolveLink($hashedId, auth()->id());

        if (!$link) {
            return response()->json(['message' => 'Link not found.'], 404);
        }

        // toArray() skips Optional fields that were absent from the request
        $link->update($data->toArray());

        return response()->json(['data' => LinkData::fromModel($link->fresh())]);
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

        return Link::where('id', $id)->where('created_by', $userId)->first();
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
