import dynamic from "next/dynamic";
import { Main } from "@/components/layout/main";

const RoomsPageClient = dynamic(
  () => import("@/components/ui/forms/RoomsPageClient"),
  {
    loading: () => (
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 animate-pulse">
        <div className="space-y-2 shrink-0">
          <div className="h-7 w-32 rounded-md bg-muted" />
          <div className="h-4 w-48 rounded-md bg-muted" />
        </div>

        <div className="my-4 lg:my-6 h-[1px] w-full bg-muted" />

        <div className="flex w-full min-w-0 overflow-auto py-1">
          <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export default function RoomsPage() {
  return (
    <Main fixed className="pt-2">
      <RoomsPageClient />
    </Main>
  );
}
