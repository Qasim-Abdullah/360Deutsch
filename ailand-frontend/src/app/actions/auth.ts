"use server";


import { cookies } from "next/headers";
import { publicApiRequest } from "@/lib/api/request";
import type { LoginResponse } from "@/types/authTypes";

export async function loginAction(
  prev: LoginResponse,
  payload: { email: string; password: string },
): Promise<LoginResponse> {
  try {
    const form = new URLSearchParams();
    form.append("username", payload.email);
    form.append("password", payload.password);

    const res = await publicApiRequest("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const body = await res.json();

    if (!res.ok) return { error: "Invalid credentials" };

    const store = await cookies();
    store.set("auth_token", body.access_token, { httpOnly: true, path: "/" });
    store.set("refresh_token", body.refresh_token, { httpOnly: true, path: "/" });

    return { user: body.user };
  } catch {
    return { error: "Login failed" };
  }
}

/* LOGOUT */
export async function logoutAction() {
  const store = await cookies();
  store.delete("auth_token");
  store.delete("refresh_token");
}