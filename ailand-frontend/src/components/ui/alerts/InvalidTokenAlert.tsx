"use client";

import { useRouter } from "next/navigation";
import { AlertDialogDemo } from "@/components/ui/alerts/AlertDialogDemo";

export function InvalidTokenDialog() {
  const router = useRouter();

  return (
    <AlertDialogDemo
      title="Invalid Link"
      description="This password reset link is missing or invalid. Please request a new one."
      confirmText="Go to Login"
      onConfirm={() => router.push("/login")}
      onClose={() => router.push("/login")}
    />
  );
}