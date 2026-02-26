import { Main } from "@/components/layout/main";
import { Separator } from "@/components/ui/sidebar/separator";
import { UserprofileContent } from "@/components/profile/UserprofileContent";

export default async function ProfilePage() {
  return (
    <Main fixed className="pt-2">
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="space-y-0.5 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Separator className="my-4 lg:my-6" />

        <div className="flex w-full min-w-0 overflow-auto py-1">
          <div className="pt-2 pb-8 w-full">
            <UserprofileContent />
          </div>
        </div>
      </div>
    </Main>
  );
}