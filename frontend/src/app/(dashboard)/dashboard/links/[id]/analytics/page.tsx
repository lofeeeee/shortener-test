"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MousePointerClick, Users, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import { analytics, type AnalyticsData } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const TEAL_SHADES = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1", "#0f766e", "#0f5f58"];

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ElementType; label: string; value: string | number; loading: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-teal-100 p-5 flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-teal-500 uppercase tracking-wide mb-1">{label}</p>
        {loading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold text-teal-900">{value.toLocaleString()}</p>}
      </div>
    </div>
  );
}

const DAYS_OPTIONS = [7, 14, 30, 60, 90] as const;

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<number>(30);

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

  useEffect(() => { load(days); }, [days, load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        {/* Days filter */}
        <div className="flex items-center gap-1 bg-white border border-teal-100 rounded-lg p-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                days === d
                  ? "bg-teal-600 text-white"
                  : "text-teal-600 hover:bg-teal-50"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={MousePointerClick} label="Total clicks (all time)" value={data?.total_clicks ?? 0} loading={loading} />
        <StatCard icon={TrendingUp} label={`Clicks (last ${days} days)`} value={data?.period_clicks ?? 0} loading={loading} />
        <StatCard icon={Users} label="Unique visitors" value={data?.unique_clicks ?? 0} loading={loading} />
      </div>

      {/* Clicks over time */}
      <div className="bg-white rounded-xl border border-teal-100 p-5">
        <h2 className="text-sm font-semibold text-teal-900 mb-4">Clicks over time</h2>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.series ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
                formatter={(v) => [Number(v), "Clicks"]}
              />
              <Line type="monotone" dataKey="clicks" stroke="#0d9488" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
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
    <div className="bg-white rounded-xl border border-teal-100 p-5">
      <h3 className="text-sm font-semibold text-teal-900 mb-4">{title}</h3>
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
