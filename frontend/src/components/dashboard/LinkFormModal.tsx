"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  const [validUntil, setValidUntil] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [errors, setErrors] = useState<{ target?: string; customSlug?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTarget(link?.link_target ?? "");
      setValidUntil(link?.valid_until ? link.valid_until.slice(0, 10) : "");
      setCustomSlug("");
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
        valid_until: validUntil || null,
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
