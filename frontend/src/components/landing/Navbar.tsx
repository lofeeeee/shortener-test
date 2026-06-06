"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Link2, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-teal-100 dark:border-gray-800 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400">
          <span className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg">
            <Link2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg">LinkShort</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-teal-800/70 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-teal-500 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="text-sm font-medium text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors duration-150"
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-teal-700 dark:text-teal-400 p-1 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-teal-100 dark:border-gray-800 px-4 pb-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-teal-800/80 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 py-2 transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
          <Link
            href={user ? "/dashboard" : "/login"}
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 py-2 transition-colors duration-150"
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      )}
    </header>
  );
}
