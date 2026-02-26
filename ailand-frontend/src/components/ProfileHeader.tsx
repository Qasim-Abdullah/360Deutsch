import Link from "next/link";
import { Pencil } from "lucide-react";
import { User } from "@/types/user";

type Props = {
  user: User;
  onEditClick?: () => void;
};

export default function ProfileHeader({ user, onEditClick }: Props) {
  const displayName =
    user.username ??
    user.email?.split("@")[0] ??
    "User"; const username = user.username ?? user.email?.split("@")[0] ?? "";
  const status = user.status ?? "Active";
  const level = user.level ?? "A1";
  const memberSince = user.memberSince
    ? user.memberSince.toLocaleDateString("en-GB")
    : "—";

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted shadow-inner sm:h-28 sm:w-28">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-primary sm:text-4xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {displayName}
          </h2>
          <p className="text-sm text-muted-foreground">@{username}</p>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
              aria-hidden
            />
            <span className="text-sm font-medium text-muted-foreground">{status}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Current Level: <span className="font-medium text-foreground">{level}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Member since: <span className="font-medium text-foreground">{memberSince}</span>
          </p>
        </div>
      </div>

      {onEditClick ? (
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5a47c7] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#9160a8]"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </button>
      ) : (
        <Link
          href="/dashboard/profile"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5a47c7] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#9160a8]"
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Link>
      )}
    </div>
  );
}
