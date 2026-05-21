import Link from "next/link";
import { Link2 } from "lucide-react";

const navGroups: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ],
  Account: [
    { label: "Sign In", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Company: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-teal-950 text-teal-300 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 text-white font-semibold">
              <span className="flex items-center justify-center w-7 h-7 bg-teal-600 rounded-lg">
                <Link2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </span>
              LinkShort
            </Link>
            <p className="text-sm text-teal-400/70 leading-relaxed max-w-xs">
              A developer-first REST API for shortening links, built with
              Laravel 11 + PostgreSQL.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(navGroups).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">
                {group}
              </p>
              {items.map(({ label, href }) => (
                href.startsWith("/") ? (
                  <Link
                    key={label}
                    href={href}
                    className="text-sm text-teal-400/70 hover:text-teal-200 transition-colors duration-150"
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={href}
                    className="text-sm text-teal-400/70 hover:text-teal-200 transition-colors duration-150"
                  >
                    {label}
                  </a>
                )
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-teal-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-teal-500">
          <p>© {new Date().getFullYear()} LinkShort. All rights reserved.</p>
          <p>Built with Laravel 11 · Next.js · shadcn/ui</p>
        </div>
      </div>
    </footer>
  );
}
