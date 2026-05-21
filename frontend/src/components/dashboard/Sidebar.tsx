"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out.");
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-teal-100 min-h-dvh">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-teal-100">
        <span className="flex items-center justify-center w-7 h-7 bg-teal-600 rounded-lg">
          <Link2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </span>
        <span className="font-semibold text-teal-800">LinkShort</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-teal-50 text-teal-700"
                  : "text-teal-800/60 hover:bg-teal-50/60 hover:text-teal-700"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-teal-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm shrink-0">
            {user?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-teal-900 truncate">{user?.display_name}</p>
            <p className="text-xs text-teal-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
