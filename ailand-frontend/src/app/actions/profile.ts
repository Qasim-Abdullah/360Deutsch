"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type {
  ProfileApiResponse,
  ProfileUpdatePayload,
  ProfileUser,
} from "@/types/profile";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ---------------------------------- */
/* Utils */
/* ---------------------------------- */

function mapProfileFromApi(data: ProfileApiResponse): ProfileUser {
  return {
    id: data.id,
    name: data.display_name ?? undefined,
    username: data.username,
    email: data.email,
    avatarUrl: data.avatar_url ?? undefined,
    bio: data.bio ?? undefined,
    status: data.status ?? undefined,
    level: data.level ?? undefined,
    memberSince: data.member_since ?? undefined,
    role: data.role ?? undefined,
    plan_id: data.plan_id ?? undefined,
  };
}

async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("auth_token")?.value ?? null;
}

/* ---------------------------------- */
/* Get Profile */
/* ---------------------------------- */

export async function getProfileAction(): Promise<ProfileUser> {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/login");
    throw new Error(`Failed to load profile (${res.status})`);
  }

  const data = (await res.json()) as ProfileApiResponse;

  return mapProfileFromApi(data);
}

/* ---------------------------------- */
/* Update Profile */
/* ---------------------------------- */

export type UpdateProfileResult =
  | { ok: true; user: ProfileUser }
  | { ok: false; error: string };

export async function updateProfileAction(
  payload: ProfileUpdatePayload
): Promise<UpdateProfileResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { ok: false, error: "Not authenticated" };
    }

    const res = await fetch(`${BASE_URL}/userinfo`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        error: (data.detail as string) || `HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      user: mapProfileFromApi(data as ProfileApiResponse),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Update failed",
    };
  }
}

/* ---------------------------------- */
/* Upload Avatar */
/* ---------------------------------- */

export type UploadAvatarResult =
  | { ok: true; avatar_url: string }
  | { ok: false; error: string };

export async function uploadAvatarAction(
  formData: FormData
): Promise<UploadAvatarResult> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { ok: false, error: "Not authenticated" };
    }

    const file = formData.get("avatar");

    if (!file || !(file instanceof File)) {
      return { ok: false, error: "No image selected" };
    }

    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "File must be an image" };
    }

    const body = new FormData();
    body.append("file", file);

    const res = await fetch(`${BASE_URL}/userinfo/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        error: (data.detail as string) || `Upload failed (${res.status})`,
      };
    }

    const url = data.avatar_url as string;

    if (!url) {
      return { ok: false, error: "Server did not return avatar URL" };
    }

    return { ok: true, avatar_url: url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Upload failed",
    };
  }
}