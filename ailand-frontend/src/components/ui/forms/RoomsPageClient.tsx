"use client";

import { RoomsGrid } from "@/components/ui/forms/roomGrid";
import { useProgress } from "@/lib/useProgress";
import { Separator } from "@/components/ui/sidebar/separator";

export default function RoomsPageClient() {
  const { progress } = useProgress();

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-w-0">
      <div className="space-y-0.5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
          Rooms
        </h1>
      </div>

      <Separator className="my-4 lg:my-6" />

      <div className="flex w-full min-w-0 overflow-auto py-1">
        <RoomsGrid roomsCompleted={progress.roomsCompleted} />
      </div>
    </div>
  );
}
