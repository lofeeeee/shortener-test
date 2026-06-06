<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\LinkClick;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Jenssegers\Agent\Agent;

class RedirectController extends Controller
{
    public function redirect(Request $request, string $uniqueId): RedirectResponse|JsonResponse
    {
        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first(['id', 'link_target', 'valid_until', 'password', 'passed', 'click_limit']);

        if (!$link) {
            return response()->json(['message' => 'Short link not found or has been deactivated.'], 404);
        }

        if ($link->isExpired()) {
            return response()->json(['message' => 'This link has expired.'], 410);
        }

        if ($link->password) {
            return response()->json(['message' => 'This link is password-protected.', 'requires_password' => true], 401);
        }

        $this->recordClick($request, $link->id);
        $this->incrementAndMaybeDeactivate($link);

        return redirect()->away($link->link_target, 302);
    }

    public function verify(Request $request, string $uniqueId): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        // Per-IP + per-slug brute-force protection (5 attempts per 15 minutes)
        $throttleKey = 'verify_fail:' . hash('sha256', $request->ip() . '|' . $uniqueId);
        $failures    = cache()->get($throttleKey, 0);

        if ($failures >= 5) {
            return response()->json([
                'message' => 'Too many failed attempts. Please try again in 15 minutes.',
            ], 429);
        }

        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first(['id', 'link_target', 'valid_until', 'password', 'passed', 'click_limit']);

        if (!$link) {
            return response()->json(['message' => 'Short link not found.'], 404);
        }

        if ($link->isExpired()) {
            return response()->json(['message' => 'This link has expired.'], 410);
        }

        if (!$link->password || !Hash::check($request->input('password'), $link->password)) {
            cache()->put($throttleKey, $failures + 1, now()->addMinutes(15));
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        // Correct password — clear failure counter
        cache()->forget($throttleKey);

        $this->recordClick($request, $link->id);
        $this->incrementAndMaybeDeactivate($link);

        return response()->json(['url' => $link->link_target]);
    }

    // Atomically increment the click counter and deactivate if the click limit is reached.
    // Using a single UPDATE avoids the TOCTOU race where two concurrent requests both pass
    // the PHP-side check and both redirect before is_active is set to false.
    private function incrementAndMaybeDeactivate(Link $link): void
    {
        DB::table('links')->where('id', $link->id)->update([
            'passed'    => DB::raw('passed + 1'),
            'is_active' => DB::raw(
                'CASE WHEN click_limit IS NOT NULL AND (passed + 1) >= click_limit THEN FALSE ELSE is_active END'
            ),
        ]);
    }

    private function recordClick(Request $request, int $linkId): void
    {
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent() ?? '');

        $deviceType = match (true) {
            $agent->isRobot()  => 'bot',
            $agent->isMobile() => 'mobile',
            $agent->isTablet() => 'tablet',
            default            => 'desktop',
        };

        LinkClick::create([
            'link_id'     => $linkId,
            'clicked_at'  => now(),
            'referrer'    => $request->headers->get('referer'),
            'browser'     => $agent->browser() ?: null,
            'os'          => $agent->platform() ?: null,
            'device_type' => $deviceType,
            'ip_hash'     => hash('sha256', $request->ip()),
        ]);
    }
}
