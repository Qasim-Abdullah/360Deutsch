"use client";

import { PointsProvider } from "@/components/levels/PointsContext";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <PointsProvider>{children}</PointsProvider>;
}
