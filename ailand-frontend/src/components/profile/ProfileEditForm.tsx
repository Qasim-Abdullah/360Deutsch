"use client";

import React, { useState, useRef } from "react";
import { updateProfileAction, uploadAvatarAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/sidebar/button";
import { Input } from "@/components/ui/sidebar/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import type { User } from "@/types/user";
import { useAuth } from "@/context/useAuth";
import { resolveAvatarUrl } from "@/lib/utils";

type Props = {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
};

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_SIZE_MB = 5;

export function ProfileEditForm({ user, onSuccess, onCancel }: Props) {
  const { setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user.username ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatarUrl = avatarPreview ?? resolveAvatarUrl(user.avatar_url) ?? null;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image (JPG, PNG, WebP or GIF).");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function clearAvatar() {
    setAvatarFile(null);

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSaving(true);

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const upload = await uploadAvatarAction(formData);

        if (!upload.ok) {
          setError(upload.error);
          setSaving(false);
          return;
        }

        avatarUrl = upload.avatar_url;
      }

      const result = await updateProfileAction({
        username: username || undefined,
        bio: bio || undefined,
        avatar_url: avatarUrl,
      });

      setSaving(false);

      if (result.ok) {
        // Update AuthContext so sidebar + profile header reflect changes immediately
        setUser({
          ...user,
          username: username || user.username,
          bio: bio || user.bio,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        });
        onSuccess();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Avatar */}
      <div className="space-y-2">
        <Label>Profile photo</Label>

        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {(displayName || user.username || "?")[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_IMAGES}
              className="hidden"
              onChange={handleAvatarChange}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload image
            </Button>

            {(avatarFile || user.avatar_url) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAvatar}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Remove photo
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max {MAX_SIZE_MB} MB.
        </p>
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="display_name">Display name</Label>

        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="bg-background"
        />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>

        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="bg-background"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>

        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          className="bg-background resize-none min-h-[100px]"
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground">
          {bio.length}/160 characters
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#5a47c7] hover:bg-[#9160a8]"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>

        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}