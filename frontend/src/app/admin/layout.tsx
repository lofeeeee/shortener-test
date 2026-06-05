"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, Link2 } from "lucide-react";

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-red-700 text-white" : "text-red-200 hover:bg-red-700/60 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (!user.is_admin) { router.replace("/dashboard"); }
  }, [user, loading, router]);

  if (loading || !user || !user.is_admin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-red-950">
        <div className="w-8 h-8 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-red-900 flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-red-800">
          <p className="text-xs font-bold text-red-300 uppercase tracking-widest">Admin Panel</p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{user.display_name}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/admin" icon={LayoutDashboard} label="Overview" active={pathname === "/admin"} />
          <NavLink href="/admin/users" icon={Users} label="Users" active={pathname.startsWith("/admin/users")} />
          <NavLink href="/dashboard" icon={Link2} label="My dashboard" active={false} />
        </nav>

        <div className="px-3 py-4 border-t border-red-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-200 hover:bg-red-700/60 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-base font-semibold text-gray-800">
            {pathname === "/admin" ? "Overview" : pathname.startsWith("/admin/users") ? "Users" : "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
