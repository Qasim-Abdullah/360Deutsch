"use server";

export type ARNode = {
  id: string;
  label: string;
  type: "root" | "level" | "category" | "subcategory" | "pos" | "entry";
  children?: ARNode[];
};

export type ApiResponse =
  | {
      ok: true;
      data: ARNode;
      message: string;
    }
  | {
      ok: false;
      reason: string;
    };

const URL = process.env.NEXT_AR_API_URL || "http://127.0.0.1:8005";

export async function getARDataAction(
  prompt: string,
): Promise<ApiResponse | null> {
  try {
    const res = await fetch(`${URL}/api/v1/kg/ar_ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
      body: JSON.stringify({
        query: prompt,
      }),
    });

    if (!res.ok) return null;

    return (await res.json()) as ApiResponse;
  } catch {
    return null;
  }
}