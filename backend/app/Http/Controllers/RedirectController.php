<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class RedirectController extends Controller
{
    public function redirect(string $uniqueId): RedirectResponse|Response
    {
        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->first();

        if (!$link) {
            return response()->view('errors.404', [], 404);
        }

        // Atomic increment to avoid race conditions under concurrent hits
        Link::where('id', $link->id)->increment('passed');

        return redirect()->away($link->link_target, 301);
    }
}
