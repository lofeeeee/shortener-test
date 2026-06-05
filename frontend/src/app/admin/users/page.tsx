"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { admin, type AuthUser } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Badge({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      on ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-100"
    }`}>
      {label}
    </span>
  );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-green-500" : "bg-gray-200"
      }`}
    >
      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = await admin.users({ page: p, per_page: 20, search: q || undefined });
      setUsers(res.data);
      setTotal(res.meta.total);
      setLastPage(res.meta.last_page);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, search); }, [page, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => load(1, val), 300);
  };

  const toggle = async (user: AuthUser, field: "is_active" | "can_custom_slug" | "is_admin") => {
    setUpdating(user.id);
    try {
      const res = await admin.updateUser(user.id, { [field]: !user[field] });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
      toast.success("User updated.");
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Users</h2>
          {!loading && <p className="text-sm text-gray-500">{total.toLocaleString()} total</p>}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 w-56"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">Active</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">Custom slug</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-center">Admin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-5 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-44" /></td>
                    <td className="px-5 py-3 text-center"><Skeleton className="h-5 w-9 mx-auto rounded-full" /></td>
                    <td className="px-5 py-3 text-center"><Skeleton className="h-5 w-9 mx-auto rounded-full" /></td>
                    <td className="px-5 py-3 text-center"><Skeleton className="h-5 w-9 mx-auto rounded-full" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{user.display_name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-gray-600 text-xs">{user.email}</td>
                    <td className="px-5 py-3 text-center">
                      <Toggle
                        checked={user.is_active}
                        onChange={() => toggle(user, "is_active")}
                        disabled={updating === user.id}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Toggle
                        checked={user.can_custom_slug}
                        onChange={() => toggle(user, "can_custom_slug")}
                        disabled={updating === user.id}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Toggle
                        checked={user.is_admin}
                        onChange={() => toggle(user, "is_admin")}
                        disabled={updating === user.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {lastPage}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className="h-8 px-3 text-xs cursor-pointer">Previous</Button>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage || loading} className="h-8 px-3 text-xs cursor-pointer">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
