"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function AuthGuard({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (!user && !isPublic) {
      logoutAction();
      router.replace("/login");
    }
  }, [user, pathname, router]);

  return null;
}