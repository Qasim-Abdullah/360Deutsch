import { Lock, Calendar } from "lucide-react";
import { User } from "@/types/user";

type Props = {
  user: User;
};

export default function ProfileStats({ user }: Props) {
  const level = user.level ?? "A1";
  const memberSince = user.memberSince
    ? user.memberSince.toLocaleDateString("en-GB")
    : "—";
    
  return (
    <div className="rounded-2xl bg-card p-5 shadow-md border border-border">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-foreground">
          <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>
            Current Level: <span className="font-medium">{level}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>
            Member since: <span className="font-medium">{memberSince}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
