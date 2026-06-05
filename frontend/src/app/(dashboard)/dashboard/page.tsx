"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Copy, Pencil, Trash2, ExternalLink, Link2, MousePointerClick, TrendingUp, Clock, QrCode, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { links as linksApi, Link } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LinkFormModal from "@/components/dashboard/LinkFormModal";
import DeleteConfirmDialog from "@/components/dashboard/DeleteConfirmDialog";
import QrCodeModal from "@/components/dashboard/QrCodeModal";
import { useRouter } from "next/navigation";

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-teal-100 p-5 flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-teal-500 uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-bold text-teal-900">{value}</p>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function truncate(str: string, max = 40) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Link[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editLink, setEditLink] = useState<Link | null>(null);
  const [deleteLink, setDeleteLink] = useState<Link | null>(null);
  const [qrLink, setQrLink] = useState<Link | null>(null);

  const PER_PAGE = 10;

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await linksApi.list({ per_page: PER_PAGE, page: p });
      setData(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
    } catch {
      toast.error("Failed to load links.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const totalClicks = data.reduce((sum, l) => sum + l.passed, 0);
  const activeCount = data.filter((l) => l.is_active && !l.is_expired).length;
  const expiredCount = data.filter((l) => l.is_expired).length;

  const shortUrl = (uniqueId: string) => `${window.location.origin}/${uniqueId}`;

  const copyShortUrl = (uniqueId: string) => {
    const url = shortUrl(uniqueId);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success("Copied to clipboard!"));
    } else {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Link2} label="Total links" value={total} loading={loading} />
        <StatCard icon={MousePointerClick} label="Total clicks" value={loading ? "…" : totalClicks} loading={loading} />
        <StatCard icon={TrendingUp} label="Active" value={loading ? "…" : activeCount} loading={loading} />
        <StatCard icon={Clock} label="Expired" value={loading ? "…" : expiredCount} loading={loading} />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-teal-100 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-teal-50">
          <h2 className="text-sm font-semibold text-teal-900">Your links</h2>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm cursor-pointer transition-colors duration-150 h-9 px-3"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New link
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-teal-50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-teal-500 uppercase tracking-wide">Short URL</th>
                <th className="px-5 py-3 text-xs font-medium text-teal-500 uppercase tracking-wide hidden sm:table-cell">Destination</th>
                <th className="px-5 py-3 text-xs font-medium text-teal-500 uppercase tracking-wide text-right">Clicks</th>
                <th className="px-5 py-3 text-xs font-medium text-teal-500 uppercase tracking-wide hidden md:table-cell">Created</th>
                <th className="px-5 py-3 text-xs font-medium text-teal-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-teal-50 last:border-0">
                    <td className="px-5 py-3.5"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-5 py-3.5 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-6 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-teal-400">
                      <Link2 className="w-10 h-10" strokeWidth={1.5} />
                      <p className="text-sm font-medium">No links yet</p>
                      <p className="text-xs">Create your first short link to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((link) => (
                  <tr key={link.id} className="border-b border-teal-50 last:border-0 hover:bg-teal-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={shortUrl(link.unique_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 font-mono font-medium hover:underline"
                          title={shortUrl(link.unique_id)}
                        >
                          /{link.unique_id}
                        </a>
                        <button
                          onClick={() => copyShortUrl(link.unique_id)}
                          className="text-teal-400 hover:text-teal-600 shrink-0 cursor-pointer"
                          aria-label="Copy short URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <a
                        href={link.link_target}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-teal-700/60 hover:text-teal-700 truncate max-w-[220px]"
                        title={link.link_target}
                      >
                        {truncate(link.link_target)}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-teal-800">
                      {link.passed.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-teal-600/60 text-xs">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {link.is_expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                          Expired
                        </span>
                      ) : link.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-600 border border-teal-100">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/links/${link.id}/analytics`)}
                          className="p-1.5 rounded-md text-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                          aria-label="View analytics"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setQrLink(link)}
                          className="p-1.5 rounded-md text-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                          aria-label="Show QR code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditLink(link)}
                          className="p-1.5 rounded-md text-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                          aria-label="Edit link"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteLink(link)}
                          className="p-1.5 rounded-md text-teal-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Delete link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-teal-50">
            <p className="text-xs text-teal-500">
              Page {page} of {lastPage}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="text-teal-700 cursor-pointer h-8 px-3 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage || loading}
                className="text-teal-700 cursor-pointer h-8 px-3 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => load(page)}
      />
      <LinkFormModal
        open={!!editLink}
        onClose={() => setEditLink(null)}
        onSaved={() => load(page)}
        link={editLink}
      />
      {deleteLink && (
        <DeleteConfirmDialog
          open={!!deleteLink}
          onClose={() => setDeleteLink(null)}
          onDeleted={() => { load(page); }}
          linkId={deleteLink.id}
          shortUrl={deleteLink.short_url}
        />
      )}
      {qrLink && (
        <QrCodeModal
          open={!!qrLink}
          onClose={() => setQrLink(null)}
          url={shortUrl(qrLink.unique_id)}
          slug={qrLink.unique_id}
        />
      )}
    </>
  );
}
