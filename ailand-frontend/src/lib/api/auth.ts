"use server";

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  ResetPassword,
  ResetPasswordResponse,
} from "@/types/authTypes";

import { publicApiRequest } from "./request";



export async function registerUser(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await publicApiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.detail?.[0]?.msg || "Registration failed");
  }

  return body;
}

/* Forgot Password */

export async function forgetPassword(email: string) {
  const res = await publicApiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Something went wrong");
  }

  return body;
}

/* Reset */

export async function resetPassword(
  payload: ResetPassword,
): Promise<ResetPasswordResponse> {
  const res = await publicApiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body?.message || "Reset failed");
  }

  return body;
}

