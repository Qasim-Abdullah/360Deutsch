"use server";

import { serverApiRequest } from "@/app/server/apiRequest";

export async function getMeAction() {
  try {
    const res = await serverApiRequest("/auth/me");

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}