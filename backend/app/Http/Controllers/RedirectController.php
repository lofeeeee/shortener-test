<?php

namespace App\Http\Controllers;

use App\Models\Link;
use App\Models\LinkClick;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Jenssegers\Agent\Agent;

class RedirectController extends Controller
{
    public function redirect(Request $request, string $uniqueId): RedirectResponse|JsonResponse
    {
        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first(['id', 'link_target', 'valid_until', 'password']);

        if (!$link) {
            return response()->json(['message' => 'Short link not found or has been deactivated.'], 404);
        }

        if ($link->isExpired()) {
            return response()->json(['message' => 'This link has expired.'], 410);
        }

        if ($link->password) {
            return response()->json(['message' => 'This link is password-protected.', 'requires_password' => true], 401);
        }

        Link::where('id', $link->id)->increment('passed');

        $agent = new Agent();
        $agent->setUserAgent($request->userAgent() ?? '');

        $deviceType = match (true) {
            $agent->isRobot() => 'bot',
            $agent->isMobile() => 'mobile',
            $agent->isTablet() => 'tablet',
            default => 'desktop',
        };

        LinkClick::create([
            'link_id'     => $link->id,
            'clicked_at'  => now(),
            'referrer'    => $request->headers->get('referer'),
            'browser'     => $agent->browser() ?: null,
            'os'          => $agent->platform() ?: null,
            'device_type' => $deviceType,
            'ip_hash'     => hash('sha256', $request->ip()),
        ]);

        return redirect()->away($link->link_target, 302);
    }

    public function verify(Request $request, string $uniqueId): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $link = Link::where('unique_id', $uniqueId)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first(['id', 'link_target', 'valid_until', 'password']);

        if (!$link) {
            return response()->json(['message' => 'Short link not found.'], 404);
        }

        if ($link->isExpired()) {
            return response()->json(['message' => 'This link has expired.'], 410);
        }

        if (!$link->password || !Hash::check($request->input('password'), $link->password)) {
            return response()->json(['message' => 'Incorrect password.'], 401);
        }

        Link::where('id', $link->id)->increment('passed');

        $agent = new Agent();
        $agent->setUserAgent($request->userAgent() ?? '');

        $deviceType = match (true) {
            $agent->isRobot() => 'bot',
            $agent->isMobile() => 'mobile',
            $agent->isTablet() => 'tablet',
            default => 'desktop',
        };

        LinkClick::create([
            'link_id'     => $link->id,
            'clicked_at'  => now(),
            'referrer'    => $request->headers->get('referer'),
            'browser'     => $agent->browser() ?: null,
            'os'          => $agent->platform() ?: null,
            'device_type' => $deviceType,
            'ip_hash'     => hash('sha256', $request->ip()),
        ]);

        return response()->json(['url' => $link->link_target]);
    }
}
