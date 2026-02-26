"use server";

import { serverApiRequest } from "@/app/server/apiRequest";



export type WordActionResult = { ok: true; message: string } | { ok: false; error: string };

export async function startWordAction(
  wordId: string,
  roomId: string
): Promise<WordActionResult> {
  try {
    const res = await serverApiRequest("/learning/words/start", {
      method: "POST",
      body: JSON.stringify({ word_id: wordId, room_id: roomId.toUpperCase() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data.detail as string) || `HTTP ${res.status}` };
    }
    return { ok: true, message: (data.message as string) || "Word started" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to start word" };
  }
}
export async function completeWordAction(wordId: string): Promise<WordActionResult> {
  try {
    const res = await serverApiRequest("/learning/words/complete", {
      method: "POST",
      body: JSON.stringify({ word_id: wordId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data.detail as string) || `HTTP ${res.status}` };
    }
    return { ok: true, message: (data.message as string) || "Word completed" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to complete word" };
  }
}
