import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const codeSnippet = `POST /api/links
Authorization: Bearer <token>

{
  "link_target": "https://example.com/very-long-url",
  "valid_until": null
}

→ 201 Created
{
  "data": {
    "short_url": "http://localhost:8000/k3xp91mz",
    "passed": 0
  }
}`;

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* background grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(to right, #0d9488 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-6">
            <Badge className="w-fit bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 px-3 py-1 text-xs font-medium">
              <Zap className="w-3 h-3 mr-1.5" />
              REST API · Laravel · Open Source
            </Badge>

            <h1 className="text-4xl sm:text-5xl font-bold text-teal-900 dark:text-gray-100 leading-tight tracking-tight">
              Shorten links.
              <br />
              Track clicks.
              <br />
              <span className="text-teal-600">Own the data.</span>
            </h1>

            <p className="text-base sm:text-lg text-teal-800/60 dark:text-gray-400 max-w-md leading-relaxed">
              A developer-first link shortener API built with Laravel. Create
              short URLs, set expiry dates, and track every redirect — all
              through a clean REST API secured with Sanctum tokens.
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  "bg-teal-600 hover:bg-teal-700 text-white gap-2 cursor-pointer transition-colors duration-150"
                )}
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 cursor-pointer transition-colors duration-150"
                )}
              >
                How It Works
              </a>
            </div>

            {/* trust badges */}
            <div className="flex flex-wrap gap-4 mt-4">
              {["Laravel 11", "Sanctum Auth", "PostgreSQL", "Argon2id"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right: code block */}
          <div className="rounded-xl bg-teal-900 text-teal-100 overflow-hidden shadow-lg font-mono text-sm">
            {/* fake window bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-teal-800/60 border-b border-teal-700/40">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-teal-400">Quick Start</span>
            </div>
            <pre className="p-5 overflow-x-auto leading-relaxed text-xs sm:text-sm">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
