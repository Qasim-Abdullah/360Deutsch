"use client";

import * as React from "react";
import { ChevronRight, LockOpen, View } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar/sidebar";
import { sideBarData } from "@/data/sidebardata";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar/sidebar";
import { useAuth } from "@/context/useAuth";
import { PROGRESS_STORAGE_KEY } from "@/lib/useProgress";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  progress?: { roomsCompleted: number; totalRooms: number } | null;
};

export function AppSidebar({
  progress: progressFromApi,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();
  const [collapsible, setCollapsible] = React.useState<"offcanvas" | "icon">(
    "offcanvas",
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)"); // md breakpoint
    const update = () => setCollapsible(mq.matches ? "icon" : "offcanvas");
    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  async function handleLogout() {
    await logoutAction();
    router.push("/login");
  }

  // Get the first incomplete level (1-4) for Continue button
  const getNextIncompleteLevel = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return 1; // No progress, start at level 1
      const data = JSON.parse(raw);
      const completedLevels: number[] = Array.isArray(data.completedLevels) ? data.completedLevels : [];
      // Find the first level that's not completed (1, 2, 3, or 4)
      for (let i = 1; i <= 4; i++) {
        if (!completedLevels.includes(i)) return i;
      }
      return 1; // All completed, restart from level 1
    } catch {
      return 1;
    }
  }, []);

  const [nextLevel, setNextLevel] = React.useState(1);
  
  React.useEffect(() => {
    setNextLevel(getNextIncompleteLevel());
    // Listen for progress updates
    const handleProgressUpdate = () => setNextLevel(getNextIncompleteLevel());
    window.addEventListener("progress-updated", handleProgressUpdate);
    return () => window.removeEventListener("progress-updated", handleProgressUpdate);
  }, [getNextIncompleteLevel]);

  const displayName =
    user?.username ?? user?.email?.split("@")[0] ?? sideBarData.user.name;

  const displayLevel = sideBarData.user.level;

  const avatarSrc =
    user?.avatar_url ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      displayName,
    )}`;

  return (
    <Sidebar collapsible={collapsible} {...props}>
      <SidebarHeader className="py-3">
        <div className="flex items-center gap-3 px-3 justify-between group-data-[collapsible=icon]:hidden">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-[#5a47c7]">360°</span>
            <span className="text-foreground">Deutsch</span>
          </h1>

          {/* Only show collapse trigger on desktop; on mobile the sheet X closes the sidebar */}
          {!isMobile && (
            <div className="cursor-pointer">
              <SidebarTrigger />
            </div>
          )}
        </div>

        <div
          className="hidden group-data-[collapsible=icon]:flex justify-center cursor-pointer"
          onClick={toggleSidebar}
        >
          <Image
            src="/assets/logo_dark.png"
            alt="360°Deutsch"
            width={42}
            height={42}
            className="block dark:hidden"
          />
          <Image
            src="/assets/logo.png"
            alt="360°Deutsch"
            width={42}
            height={42}
            className="hidden dark:block"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <div className="px-4 mb-5 group-data-[collapsible=icon]:hidden">
          <div className="rounded-2xl bg-gradient-to-r from-[#5a47c7] via-[#9160a8] to-[#dc9b6c] p-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white shrink-0">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 text-white min-w-0">
                <p className="text-base font-semibold leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-xs opacity-90">{displayLevel}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-1 group-data-[collapsible=icon]:hidden">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Dashboard
          </h3>
        </div>

        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {sideBarData.navMain.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`h-11 ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-[#5a47c7] rounded-r-md"
                          : ""
                      }`}
                      isActive={isActive}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-4 mt-auto mb-4 group-data-[collapsible=icon]:hidden">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Progress
          </h3>

          <Link href="/webxr">
            <div className="rounded-xl bg-background p-4 shadow-sm cursor-pointer hover:bg-muted/50 transition">
              <div className="flex items-center gap-3">
                <View className="h-5 w-5 text-[#5a47c7]" />
                <p className="text-sm font-medium">AR View</p>
              </div>
            </div>
          </Link>

          <Link href={`/dashboard/side_room/level${nextLevel}`}>
            <button className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#5a47c7] via-[#9160a8] to-[#dc9b6c] p-4 text-white shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <LockOpen className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-semibold">Continue</p>
                    <p className="text-xs opacity-90">
                      Level {nextLevel}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter className="pt-3">
        <SidebarMenu>
          {sideBarData.bottomActions.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.title === "Logout" ? (
                <SidebarMenuButton
                  tooltip={item.title}
                  className="h-10 w-full flex items-center gap-3 cursor-pointer"
                  onClick={handleLogout}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="h-10"
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
