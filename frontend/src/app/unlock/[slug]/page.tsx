"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Lock, Loader2, Link2 } from "lucide-react";
import { links } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnlockPage() {
  const { slug } = useParams<{ slug: string }>();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Enter the password."); return; }
    setError("");
    setLoading(true);
    try {
      const { url } = await links.verify(slug, password);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password.");
      setLoading(false);
      inputRef.current?.select();
    }
  };

  return (
    <div className="min-h-dvh bg-teal-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg">
            <Link2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-semibold text-teal-800 dark:text-teal-300 text-lg">LinkShort</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-teal-100 dark:border-gray-800 shadow-sm p-8">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600">
              <Lock className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-teal-900 dark:text-gray-100">Password required</h1>
              <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                This link is protected. Enter the password to continue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
              <Input
                ref={inputRef}
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                aria-invalid={!!error}
                className={error ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              {loading ? "Verifying…" : "Unlock & continue"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-teal-500 dark:text-teal-600 mt-6">
          /{slug}
        </p>
      </div>
    </div>
  );
}
