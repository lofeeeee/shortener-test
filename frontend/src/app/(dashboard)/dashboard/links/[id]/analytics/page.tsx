"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MousePointerClick, Users, TrendingUp, Download, GitCompare } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { analytics, type AnalyticsData } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const TEAL_SHADES = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1", "#0f766e", "#0f5f58"];

function pctChange(current: number, prev: number): { value: string; up: boolean } | null {
  if (!prev) return null;
  const p = ((current - prev) / prev) * 100;
  return { value: Math.abs(p).toFixed(1), up: p >= 0 };
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
  delta?: { value: string; up: boolean } | null;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-5 flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-teal-500 dark:text-teal-400 uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-teal-900 dark:text-gray-100">{Number(value).toLocaleString()}</p>
            {delta && (
              <span className={`text-xs font-medium ${delta.up ? "text-green-500" : "text-red-400"}`}>
                {delta.up ? "↑" : "↓"}{delta.value}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const DAYS_OPTIONS = [7, 14, 30, 60, 90] as const;

function downloadCSV(data: AnalyticsData, compareData: AnalyticsData | null, days: number) {
  const headers = ["Date", "Clicks", ...(compareData ? ["Previous period clicks"] : [])];
  const rows = data.series.map((point, i) => [
    point.date,
    point.clicks,
    ...(compareData ? [compareData.series[i]?.clicks ?? 0] : []),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analytics-${days}d.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [compareData, setCompareData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareLoading, setCompareLoading] = useState(false);
  const [days, setDays] = useState<number>(30);
  const [compare, setCompare] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await analytics.get(id, d);
      setData(res.data);
    } catch {
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCompare = useCallback(async (d: number) => {
    setCompareLoading(true);
    try {
      const res = await analytics.get(id, d, d);
      setCompareData(res.data);
    } catch {
      setCompareData(null);
    } finally {
      setCompareLoading(false);
    }
  }, [id]);

  useEffect(() => { load(days); }, [days, load]);

  useEffect(() => {
    if (compare) {
      loadCompare(days);
    } else {
      setCompareData(null);
    }
  }, [compare, days, loadCompare]);

  // Merge current + previous series for the chart
  const mergedSeries = data?.series.map((point, i) => ({
    date: point.date,
    clicks: point.clicks,
    ...(compareData ? { prev: compareData.series[i]?.clicks ?? 0 } : {}),
  })) ?? [];

  const periodDelta = compareData
    ? pctChange(data?.period_clicks ?? 0, compareData.period_clicks)
    : null;
  const uniqueDelta = compareData
    ? pctChange(data?.unique_clicks ?? 0, compareData.unique_clicks)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare toggle */}
          <button
            onClick={() => setCompare((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              compare
                ? "bg-teal-600 text-white border-teal-600"
                : "text-teal-600 border-teal-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-gray-800"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Compare
          </button>

          {/* CSV download */}
          {data && (
            <button
              onClick={() => downloadCSV(data, compareData, days)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-teal-200 dark:border-gray-700 text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}

          {/* Days filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-teal-100 dark:border-gray-700 rounded-lg p-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  days === d
                    ? "bg-teal-600 text-white"
                    : "text-teal-600 hover:bg-teal-50 dark:hover:bg-gray-800"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {compare && compareData && (
        <p className="text-xs text-teal-500 dark:text-teal-400 -mt-2">
          Comparing last {days} days vs previous {days} days
        </p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={MousePointerClick} label="Total clicks (all time)" value={data?.total_clicks ?? 0} loading={loading} />
        <StatCard
          icon={TrendingUp}
          label={`Clicks (last ${days} days)`}
          value={data?.period_clicks ?? 0}
          loading={loading || compareLoading}
          delta={periodDelta}
        />
        <StatCard
          icon={Users}
          label="Unique visitors"
          value={data?.unique_clicks ?? 0}
          loading={loading || compareLoading}
          delta={uniqueDelta}
        />
      </div>

      {/* Clicks over time — AreaChart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-teal-900 dark:text-gray-100 mb-4">Clicks over time</h2>
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mergedSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-current" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-prev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#5eead4" }}
                tickFormatter={(v) => v.slice(5)}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: "#5eead4" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "#99f6e4", fontSize: 12 }}
                formatter={(v, name) => [Number(v), name === "prev" ? "Previous period" : "Current period"]}
              />
              {compareData && <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v) => v === "prev" ? "Previous period" : "Current period"} />}
              <Area type="monotone" dataKey="clicks" name="clicks" stroke="#0d9488" strokeWidth={2} fill="url(#grad-current)" dot={false} activeDot={{ r: 4 }} />
              {compareData && (
                <Area type="monotone" dataKey="prev" name="prev" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" fill="url(#grad-prev)" dot={false} activeDot={{ r: 3 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdowns row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BreakdownCard title="Browser" data={data?.by_browser ?? []} loading={loading} type="bar" />
        <BreakdownCard title="OS" data={data?.by_os ?? []} loading={loading} type="bar" />
        <BreakdownCard title="Device" data={data?.by_device ?? []} loading={loading} type="pie" />
        <BreakdownCard title="Top referrers" data={data?.by_referrer ?? []} loading={loading} type="bar" />
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  data,
  loading,
  type,
}: {
  title: string;
  data: { name: string; count: number }[];
  loading: boolean;
  type: "bar" | "pie";
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-teal-900 dark:text-gray-100 mb-4">{title}</h3>
      {loading ? (
        <Skeleton className="h-36 w-full" />
      ) : data.length === 0 ? (
        <p className="text-xs text-teal-400 text-center py-8">No data yet</p>
      ) : type === "bar" ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#5eead4" }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#0f766e" }} width={70} />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: "#99f6e4", fontSize: 11 }}
              formatter={(v) => [Number(v), "Clicks"]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={TEAL_SHADES[i % TEAL_SHADES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={false}>
              {data.map((_, i) => (
                <Cell key={i} fill={TEAL_SHADES[i % TEAL_SHADES.length]} />
              ))}
            </Pie>
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: "#99f6e4", fontSize: 11 }}
              formatter={(v) => [Number(v), "Clicks"]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
