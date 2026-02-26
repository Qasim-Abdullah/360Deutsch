import {
  User as UserIcon,
  AtSign,
  MessageCircle,
  Mail,
} from "lucide-react";

import { User } from "@/types/user";

type Props = {
  user: User;
};

export default function ProfileInfo({ user }: Props) {
  const displayName = user.username ?? user.username ?? user.email?.split("@")[0] ?? "User";
  const username = user.username ?? user.email?.split("@")[0] ?? "";
  const bio = user.bio ?? "No bio yet.";
  const email = user.email ?? "";

  return (
    <div className="rounded-2xl bg-card p-5 shadow-md border border-border">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-foreground">
          <UserIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{displayName}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <AtSign className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>@{username}</span>
        </div>
        {email && (
          <div className="flex items-center gap-3 text-foreground">
            <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{email}</span>
          </div>
        )}
        <div className="flex items-start gap-3 text-foreground">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{bio}</span>
        </div>
      </div>
    </div>
  );
}
