"use client";

import { useState, useEffect } from "react";
import { Users, Link2, MousePointerClick, TrendingUp } from "lucide-react";
import { admin, type AdminStats } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function StatCard({ icon: Icon, label, value, loading, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  loading: boolean;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {loading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>}
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.stats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Site overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Real-time statistics across all users.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={stats?.total_users ?? 0} loading={loading} color="bg-blue-50 text-blue-600" />
        <StatCard icon={Link2} label="Total links" value={stats?.total_links ?? 0} loading={loading} color="bg-purple-50 text-purple-600" />
        <StatCard icon={TrendingUp} label="Active links" value={stats?.active_links ?? 0} loading={loading} color="bg-green-50 text-green-600" />
        <StatCard icon={MousePointerClick} label="Total clicks" value={stats?.total_clicks ?? 0} loading={loading} color="bg-orange-50 text-orange-600" />
      </div>
    </div>
  );
}
