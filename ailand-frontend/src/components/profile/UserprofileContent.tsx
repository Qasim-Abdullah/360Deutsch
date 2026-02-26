"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";

import ProfileHeader from "@/components/ProfileHeader";
import ProfileInfo from "@/components/ProfileInfo";
import ProfileStats from "@/components/ProfileStats";
import { ProfileEditForm } from "./ProfileEditForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function UserprofileContent() {
  const { user } = useAuth(); // ✅ HERE
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  function handleEditSuccess() {
    setEditOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="relative rounded-2xl bg-card p-6 shadow-lg border border-border sm:p-8">
        <ProfileHeader user={user} onEditClick={() => setEditOpen(true)} />
      </div>

      <div className="relative mt-8 flex flex-col gap-4">
        <ProfileInfo user={user} />
        <ProfileStats user={user} />
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-border shadow-lg">          <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name, username, and avatar.
          </DialogDescription>
        </DialogHeader>

          <div className="mt-4">
            <ProfileEditForm
              user={user}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}