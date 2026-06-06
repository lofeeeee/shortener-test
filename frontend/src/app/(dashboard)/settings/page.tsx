"use client";

import { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { users } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProfileFields {
  display_name: string;
  email: string;
}

interface PasswordFields {
  password: string;
  password_confirmation: string;
}

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileFields>({
    display_name: user?.display_name ?? "",
    email: user?.email ?? "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileFields>>({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [pw, setPw] = useState<PasswordFields>({ password: "", password_confirmation: "" });
  const [pwErrors, setPwErrors] = useState<Partial<PasswordFields>>({});
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const setP = (k: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((f) => ({ ...f, [k]: e.target.value }));

  const validateProfile = () => {
    const e: Partial<ProfileFields> = {};
    if (!profile.display_name.trim()) e.display_name = "Display name is required.";
    if (!profile.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) e.email = "Enter a valid email.";
    return e;
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setProfileErrors({});
    setProfileLoading(true);
    try {
      await users.update(user!.id, { display_name: profile.display_name, email: profile.email });
      await refreshUser();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setProfileLoading(false);
    }
  };

  const validatePw = () => {
    const e: Partial<PasswordFields> = {};
    if (!pw.password) e.password = "New password is required.";
    else if (pw.password.length < 8) e.password = "At least 8 characters.";
    if (pw.password !== pw.password_confirmation) e.password_confirmation = "Passwords do not match.";
    return e;
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await users.update(user!.id, { password: pw.password, password_confirmation: pw.password_confirmation });
      setPw({ password: "", password_confirmation: "" });
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password update failed.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await users.delete(user!.id);
      await logout();
      toast.success("Account deleted.");
      router.replace("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Profile */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-teal-900 dark:text-gray-100 mb-4">Profile</h2>
        <form onSubmit={handleProfileSave} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={profile.display_name}
              onChange={setP("display_name")}
              aria-invalid={!!profileErrors.display_name}
              className={profileErrors.display_name ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {profileErrors.display_name && (
              <p className="text-xs text-red-500">{profileErrors.display_name}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={setP("email")}
              aria-invalid={!!profileErrors.email}
              className={profileErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {profileErrors.email && (
              <p className="text-xs text-red-500">{profileErrors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Username</Label>
            <Input value={user?.username ?? ""} disabled className="opacity-50 cursor-not-allowed" />
            <p className="text-xs text-teal-500 dark:text-teal-400">Username cannot be changed.</p>
          </div>

          <div className="flex justify-end mt-1">
            <Button
              type="submit"
              disabled={profileLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors duration-150"
            >
              {profileLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save profile
            </Button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-teal-100 dark:border-gray-800 p-6">
        <h2 className="text-base font-semibold text-teal-900 dark:text-gray-100 mb-4">Change password</h2>
        <form onSubmit={handlePasswordSave} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={pw.password}
              onChange={(e) => setPw((f) => ({ ...f, password: e.target.value }))}
              aria-invalid={!!pwErrors.password}
              className={pwErrors.password ? "border-red-400 focus-visible:ring-red-400" : ""}
              autoComplete="new-password"
            />
            {pwErrors.password && <p className="text-xs text-red-500">{pwErrors.password}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={pw.password_confirmation}
              onChange={(e) => setPw((f) => ({ ...f, password_confirmation: e.target.value }))}
              aria-invalid={!!pwErrors.password_confirmation}
              className={pwErrors.password_confirmation ? "border-red-400 focus-visible:ring-red-400" : ""}
              autoComplete="new-password"
            />
            {pwErrors.password_confirmation && (
              <p className="text-xs text-red-500">{pwErrors.password_confirmation}</p>
            )}
          </div>

          <div className="flex justify-end mt-1">
            <Button
              type="submit"
              disabled={pwLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors duration-150"
            >
              {pwLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update password
            </Button>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/40 p-6">
        <h2 className="text-base font-semibold text-red-600 mb-1">Danger zone</h2>
        <p className="text-sm text-teal-700/60 dark:text-gray-400 mb-4">
          Deleting your account is permanent. All your links and data will be removed.
        </p>
        <Button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="border border-red-200 dark:border-red-800 bg-white dark:bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors duration-150"
          variant="ghost"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete account
        </Button>
      </section>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={(v) => !v && setDeleteOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-teal-900 dark:text-gray-100">Delete account?</DialogTitle>
            <DialogDescription className="text-teal-700/70 dark:text-gray-400 text-sm pt-1">
              This action is permanent and cannot be undone. All your links and data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors duration-150"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
