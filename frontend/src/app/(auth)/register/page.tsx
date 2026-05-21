"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Fields {
  username: string;
  display_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    username: "", display_name: "", email: "", password: "", password_confirmation: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Fields>>({});

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): Partial<Fields> => {
    const e: Partial<Fields> = {};
    if (!fields.username) e.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_-]+$/.test(fields.username)) e.username = "Letters, numbers, _ and - only.";
    if (!fields.display_name) e.display_name = "Display name is required.";
    if (!fields.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e.email = "Enter a valid email.";
    if (!fields.password) e.password = "Password is required.";
    else if (fields.password.length < 8) e.password = "At least 8 characters.";
    if (fields.password !== fields.password_confirmation)
      e.password_confirmation = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(fields);
      toast.success("Account created! Welcome.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const field = (id: keyof Fields, label: string, type = "text", extra?: React.ReactNode) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={fields[id]}
          onChange={set(id)}
          aria-invalid={!!errors[id]}
          className={`${type === "password" ? "pr-10" : ""} ${errors[id] ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {extra}
      </div>
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw(!showPw)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 hover:text-teal-700 cursor-pointer"
      aria-label={showPw ? "Hide password" : "Show password"}
    >
      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <>
      <h1 className="text-2xl font-bold text-teal-900 mb-1">Create account</h1>
      <p className="text-sm text-teal-700/60 mb-6">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {field("username", "Username")}
        {field("display_name", "Display name")}
        {field("email", "Email", "email")}
        {field(
          "password",
          "Password",
          showPw ? "text" : "password",
          pwToggle
        )}
        {field(
          "password_confirmation",
          "Confirm password",
          showPw ? "text" : "password"
        )}

        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white mt-2 cursor-pointer transition-colors duration-150"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create account
        </Button>
      </form>
    </>
  );
}
