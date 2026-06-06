<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\LinkClick;
use App\Services\HashIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $days   = min((int) $request->query('days', 30), 90);
        $offset = max(0, min((int) $request->query('offset', 0), 365));

        $since = now()->subDays($days + $offset)->startOfDay();
        $until = $offset > 0 ? now()->subDays($offset)->endOfDay() : now();

        $baseQuery = fn () => LinkClick::where('link_id', $link->id)
            ->where('clicked_at', '>=', $since)
            ->where('clicked_at', '<=', $until);

        // ── Series: daily totals via SQL GROUP BY ─────────────────────────
        $byDay = $baseQuery()
            ->selectRaw("TO_CHAR(clicked_at, 'YYYY-MM-DD') AS date, COUNT(*) AS clicks")
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('clicks', 'date');

        $series  = [];
        $endDate = now()->subDays($offset);
        for ($i = $days - 1; $i >= 0; $i--) {
            $date     = $endDate->copy()->subDays($i)->format('Y-m-d');
            $series[] = ['date' => $date, 'clicks' => (int) ($byDay[$date] ?? 0)];
        }

        // ── Aggregate stats ───────────────────────────────────────────────
        $totalInPeriod  = $baseQuery()->count();
        $uniqueInPeriod = $baseQuery()->whereNotNull('ip_hash')
            ->count(DB::raw('DISTINCT ip_hash'));

        // ── Breakdowns via SQL GROUP BY ───────────────────────────────────
        $byBrowser = $baseQuery()
            ->whereNotNull('browser')
            ->selectRaw('browser AS name, COUNT(*) AS count')
            ->groupBy('browser')
            ->orderByDesc('count')
            ->limit(8)
            ->get(['name', 'count']);

        $byOs = $baseQuery()
            ->whereNotNull('os')
            ->selectRaw('os AS name, COUNT(*) AS count')
            ->groupBy('os')
            ->orderByDesc('count')
            ->limit(8)
            ->get(['name', 'count']);

        $byDevice = $baseQuery()
            ->whereNotNull('device_type')
            ->selectRaw('device_type AS name, COUNT(*) AS count')
            ->groupBy('device_type')
            ->orderByDesc('count')
            ->get(['name', 'count']);

        // Referrer host parsing still needs PHP; limit the row set to keep it fast
        $referrerRows = $baseQuery()
            ->whereNotNull('referrer')
            ->select('referrer')
            ->limit(5000)
            ->get();

        $byReferrer = $referrerRows
            ->groupBy(fn ($c) => parse_url($c->referrer, PHP_URL_HOST) ?? $c->referrer)
            ->map(fn ($g) => $g->count())
            ->sortDesc()
            ->take(10);

        return response()->json([
            'data' => [
                'total_clicks'  => $link->passed,
                'period_clicks' => $totalInPeriod,
                'unique_clicks' => $uniqueInPeriod,
                'days'          => $days,
                'series'        => $series,
                'by_browser'    => $this->toBreakdown($byBrowser),
                'by_os'         => $this->toBreakdown($byOs),
                'by_device'     => $this->toBreakdown($byDevice),
                'by_referrer'   => $this->toBreakdown($byReferrer),
            ],
        ]);
    }

    private function toBreakdown(mixed $col): array
    {
        if ($col instanceof \Illuminate\Support\Collection) {
            // Keyed collection (referrer) vs model collection (SQL results)
            if ($col->first() instanceof \Illuminate\Database\Eloquent\Model) {
                return $col->map(fn ($r) => ['name' => $r->name, 'count' => (int) $r->count])->values()->all();
            }
            return $col->map(fn ($count, $name) => ['name' => $name, 'count' => $count])->values()->all();
        }
        return [];
    }
}
