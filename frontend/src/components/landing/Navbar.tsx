"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Link2, Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur-sm border-b border-teal-100 shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-teal-700">
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
              className="text-sm font-medium text-teal-800/70 hover:text-teal-700 transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-teal-700 hover:text-teal-600 transition-colors duration-150"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants(),
              "bg-orange-600 hover:bg-orange-700 text-white text-sm cursor-pointer transition-colors duration-150"
            )}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-teal-700 p-1 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-teal-100 px-4 pb-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-teal-800/80 hover:text-teal-700 py-2 transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-teal-700 hover:text-teal-600 py-2 transition-colors duration-150"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants(),
              "bg-orange-600 hover:bg-orange-700 text-white mt-1 cursor-pointer justify-center"
            )}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
