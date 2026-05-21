"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Link2, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Header({ title }: { title: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out.");
    router.push("/login");
  };

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-teal-100 bg-white lg:px-8">
        {/* Mobile: logo + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex items-center justify-center w-7 h-7 bg-teal-600 rounded-lg">
            <Link2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-teal-800">LinkShort</span>
        </div>

        {/* Desktop: page title */}
        <h1 className="hidden lg:block text-lg font-semibold text-teal-900">{title}</h1>

        <div className="flex items-center gap-3">
          {/* Desktop: user avatar */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-sm">
              {user?.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-medium text-teal-800">{user?.display_name}</span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-teal-700 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white border-b border-teal-100 px-4 pb-4 flex flex-col gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active ? "bg-teal-50 text-teal-700" : "text-teal-800/60 hover:bg-teal-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
