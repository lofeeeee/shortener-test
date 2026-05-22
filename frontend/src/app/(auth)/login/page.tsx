"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier) e.identifier = "Email or username is required.";
    if (!password) e.password = "Password is required.";
    return e;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(identifier, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-900 mb-1">Sign in</h1>
      <p className="text-sm text-teal-700/60 mb-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-600 font-medium hover:underline">
          Register
        </Link>
      </p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or johndoe"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-invalid={!!errors.identifier}
            className={errors.identifier ? "border-red-400 focus-visible:ring-red-400" : ""}
          />
          {errors.identifier && <p className="text-xs text-red-500">{errors.identifier}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              aria-invalid={!!errors.password}
              className={`pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-700 cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className={cn(
            buttonVariants(),
            "bg-teal-600 hover:bg-teal-700 text-white mt-2 cursor-pointer transition-colors duration-150 w-full h-9"
          )}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Sign in
        </button>
      </div>
    </>
  );
}
