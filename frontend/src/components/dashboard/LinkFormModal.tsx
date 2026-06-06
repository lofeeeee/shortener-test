"use client";

import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { links, Link } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  link?: Link | null;
}

export default function LinkFormModal({ open, onClose, onSaved, link }: Props) {
  const isEdit = !!link;
  const { user } = useAuth();
  const canCustomSlug = !!user?.can_custom_slug;

  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clickLimit, setClickLimit] = useState("");
  const [errors, setErrors] = useState<{ target?: string; customSlug?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTarget(link?.link_target ?? "");
      setTitle(link?.title ?? "");
      setValidUntil(link?.valid_until ? link.valid_until.slice(0, 10) : "");
      setCustomSlug("");
      setPassword("");
      setShowPassword(false);
      setClickLimit(link?.click_limit ? String(link.click_limit) : "");
      setErrors({});
    }
  }, [open, link]);

  const validate = () => {
    const e: typeof errors = {};
    if (!target.trim()) {
      e.target = "Destination URL is required.";
    } else {
      try {
        new URL(target.trim());
      } catch {
        e.target = "Enter a valid URL (include https://).";
      }
    }
    if (canCustomSlug && !isEdit && customSlug) {
      if (!/^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/.test(customSlug)) {
        e.customSlug = "3–20 chars, lowercase letters, numbers, hyphens, underscores. Must start and end with a letter or number.";
      }
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const body = {
        link_target: target.trim(),
        title: title.trim() || null,
        valid_until: validUntil || null,
        password: password || null,
        click_limit: clickLimit ? parseInt(clickLimit, 10) : null,
        ...(canCustomSlug && !isEdit && customSlug ? { custom_slug: customSlug } : {}),
      };
      if (isEdit && link) {
        await links.update(link.id, body);
        toast.success("Link updated.");
      } else {
        await links.create(body);
        toast.success("Link created.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-900">
            {isEdit ? "Edit link" : "Create short link"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-title">
              Title <span className="text-teal-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="link-title"
              type="text"
              placeholder="My awesome link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-target">Destination URL</Label>
            <Input
              id="link-target"
              type="url"
              placeholder="https://example.com/very/long/url"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-invalid={!!errors.target}
              className={errors.target ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {errors.target && <p className="text-xs text-red-500">{errors.target}</p>}
          </div>

          {canCustomSlug && !isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="custom-slug">
                Custom slug{" "}
                <span className="text-teal-500 font-normal">(optional — leave blank to auto-generate)</span>
              </Label>
              <Input
                id="custom-slug"
                type="text"
                placeholder="my-link"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                maxLength={20}
                aria-invalid={!!errors.customSlug}
                className={errors.customSlug ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.customSlug
                ? <p className="text-xs text-red-500">{errors.customSlug}</p>
                : <p className="text-xs text-teal-500/70">Only lowercase letters, numbers, hyphens, and underscores.</p>
              }
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valid-until">
              Expiry date{" "}
              <span className="text-teal-500 font-normal">(optional — leave blank for permanent)</span>
            </Label>
            <Input
              id="valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-password">
              Password <span className="text-teal-500 font-normal">(optional — protects the redirect)</span>
            </Label>
            <div className="relative">
              <Input
                id="link-password"
                type={showPassword ? "text" : "password"}
                placeholder={isEdit && link?.is_protected ? "Leave blank to keep current password" : "Set a password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isEdit && link?.is_protected && !password && (
              <p className="text-xs text-teal-500/70">This link already has a password set.</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="click-limit">
              Click limit <span className="text-teal-500 font-normal">(optional — auto-deactivates after N clicks)</span>
            </Label>
            <Input
              id="click-limit"
              type="number"
              min={1}
              max={1000000}
              placeholder="e.g. 100"
              value={clickLimit}
              onChange={(e) => setClickLimit(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors duration-150"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Save changes" : "Create link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
