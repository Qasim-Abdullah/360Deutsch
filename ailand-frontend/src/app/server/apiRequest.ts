"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function serverApiRequest(
  url: string,
  options: RequestInit = {},
) {
  const store = await cookies();
  const token = store.get("auth_token")?.value;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(BASE_URL + url, {
    ...options,
    credentials: "omit",
    headers,
  });
}