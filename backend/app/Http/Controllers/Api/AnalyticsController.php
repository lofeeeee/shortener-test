<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\LinkClick;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private HashIdService $hashIds) {}

    public function show(Request $request, string $hashedId): JsonResponse
    {
        $id = $this->hashIds->decode($hashedId);

        $link = Link::where('id', $id)
            ->where('created_by', $request->user()->id)
            ->first(['id', 'unique_id', 'passed']);

        if (!$link) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        $days = min((int) $request->query('days', 30), 90);
        $since = now()->subDays($days)->startOfDay();

        $clicks = LinkClick::where('link_id', $link->id)
            ->where('clicked_at', '>=', $since)
            ->get(['clicked_at', 'browser', 'os', 'device_type', 'ip_hash', 'referrer']);

        $byDay = $clicks
            ->groupBy(fn ($c) => $c->clicked_at->format('Y-m-d'))
            ->map(fn ($g) => $g->count())
            ->sortKeys();

        // Fill missing days with 0
        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $series[] = ['date' => $date, 'clicks' => $byDay[$date] ?? 0];
        }

        $byBrowser = $clicks->whereNotNull('browser')
            ->groupBy('browser')
            ->map(fn ($g) => $g->count())
            ->sortDesc()
            ->take(8);

        $byOs = $clicks->whereNotNull('os')
            ->groupBy('os')
            ->map(fn ($g) => $g->count())
            ->sortDesc()
            ->take(8);

        $byDevice = $clicks->whereNotNull('device_type')
            ->groupBy('device_type')
            ->map(fn ($g) => $g->count())
            ->sortDesc();

        $byReferrer = $clicks->whereNotNull('referrer')
            ->groupBy(fn ($c) => parse_url($c->referrer, PHP_URL_HOST) ?? $c->referrer)
            ->map(fn ($g) => $g->count())
            ->sortDesc()
            ->take(10);

        $totalInPeriod = $clicks->count();
        $uniqueInPeriod = $clicks->whereNotNull('ip_hash')->pluck('ip_hash')->unique()->count();

        return response()->json([
            'data' => [
                'total_clicks'   => $link->passed,
                'period_clicks'  => $totalInPeriod,
                'unique_clicks'  => $uniqueInPeriod,
                'days'           => $days,
                'series'         => $series,
                'by_browser'     => $this->toBreakdown($byBrowser),
                'by_os'          => $this->toBreakdown($byOs),
                'by_device'      => $this->toBreakdown($byDevice),
                'by_referrer'    => $this->toBreakdown($byReferrer),
            ],
        ]);
    }

    private function toBreakdown(\Illuminate\Support\Collection $col): array
    {
        return $col->map(fn ($count, $name) => ['name' => $name, 'count' => $count])->values()->all();
    }
}
