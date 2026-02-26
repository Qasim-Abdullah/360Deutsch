import type { User } from "@/types/user";
import { apiRequest } from "../../app/api/request";

export async function getUser(): Promise<User | null> {
  const res = await apiRequest("/auth/me");

  if (res.status === 401) return null;

  if (!res.ok) return null;

  return res.json();
}
