<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class RedirectController extends Controller
{
    public function redirect(string $uniqueId): RedirectResponse|JsonResponse
    {
        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->first();

        if (!$link) {
            return response()->json(['message' => 'Short link not found or has been deactivated.'], 404);
        }

        if ($link->isExpired()) {
            return response()->json(['message' => 'This link has expired.'], 410);
        }

        // Atomic increment to avoid race conditions under concurrent hits
        Link::where('id', $link->id)->increment('passed');

        return redirect()->away($link->link_target, 301);
    }
}
