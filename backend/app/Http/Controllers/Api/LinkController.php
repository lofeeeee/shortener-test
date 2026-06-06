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
use Illuminate\Support\Facades\Hash;

class LinkController extends Controller
{
    public function __construct(private HashIdService $hashId) {}

    public function index(Request $request): JsonResponse
    {
        $query = Link::where('created_by', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if (!$request->boolean('include_deleted')) {
            $query->whereNull('deleted_at');
        }

        if (!$request->boolean('include_expired')) {
            $query->where(function ($q) {
                $q->whereNull('valid_until')->orWhere('valid_until', '>', now());
            });
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('unique_id', 'like', "%{$search}%")
                  ->orWhere('link_target', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
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
        $user = $request->user();
        $customSlug = !($data->custom_slug instanceof \Spatie\LaravelData\Optional) ? $data->custom_slug : null;

        if ($customSlug && $user->can_custom_slug) {
            if (Link::where('unique_id', $customSlug)->exists()) {
                return response()->json(['message' => 'This slug is already taken. Please choose another.'], 422);
            }
            $uniqueId = $customSlug;
        } else {
            $uniqueId = $this->generateUniqueId();
        }

        $password = (!($data->password instanceof \Spatie\LaravelData\Optional) && $data->password)
            ? Hash::make($data->password)
            : null;

        $link = Link::create([
            'link_target' => $data->link_target,
            'title'       => (!($data->title instanceof \Spatie\LaravelData\Optional)) ? $data->title : null,
            'password'    => $password,
            'valid_until' => $data->valid_until,
            'click_limit' => (!($data->click_limit instanceof \Spatie\LaravelData\Optional)) ? $data->click_limit : null,
            'unique_id'   => $uniqueId,
            'passed'      => 0,
            'is_active'   => true,
            'created_by'  => $user->id,
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

        $payload = $data->toArray();

        // Hash the new password if provided; null removes it.
        if (array_key_exists('password', $payload)) {
            $payload['password'] = $payload['password'] ? Hash::make($payload['password']) : null;
        }

        $link->update($payload);

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

    public function bulkDestroy(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array|min:1|max:100', 'ids.*' => 'string']);

        $ids = array_filter(array_map(fn ($id) => $this->hashId->decode($id), $request->input('ids')));

        Link::where('created_by', $request->user()->id)
            ->whereIn('id', $ids)
            ->whereNull('deleted_at')
            ->update(['is_active' => false, 'deleted_at' => now(), 'deleted_by' => $request->user()->id]);

        return response()->json(['message' => 'Links deleted.']);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'ids'       => 'required|array|min:1|max:100',
            'ids.*'     => 'string',
            'is_active' => 'required|boolean',
        ]);

        $ids = array_filter(array_map(fn ($id) => $this->hashId->decode($id), $request->input('ids')));

        Link::where('created_by', $request->user()->id)
            ->whereIn('id', $ids)
            ->whereNull('deleted_at')
            ->update(['is_active' => $request->boolean('is_active')]);

        return response()->json(['message' => 'Links updated.']);
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
