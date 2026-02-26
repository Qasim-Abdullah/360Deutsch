import { apiFetch } from "@/lib/api/client";
import level1 from "@/data/levels/level1";
import level2 from "@/data/levels/level2";
import level3 from "@/data/levels/level3";

/** Use backend API for level data when available. Set to true when backend exposes /levels/{levelId} */
const USE_LEVELS_API = process.env.NEXT_PUBLIC_USE_LEVELS_API === "true";

const API_BASE_PATH = "/kg/levels";

export type LevelData = typeof level1 | typeof level2 | typeof level3;

export async function getLevel(levelId: "level1"): Promise<typeof level1>;
export async function getLevel(levelId: "level2"): Promise<typeof level2>;
export async function getLevel(levelId: "level3"): Promise<typeof level3>;
export async function getLevel(levelId: string): Promise<LevelData>;
export async function getLevel(levelId: string): Promise<LevelData> {
  if (USE_LEVELS_API) {
    try {
      const data = await apiFetch<unknown>(
        `${API_BASE_PATH}/${encodeURIComponent(levelId)}`
      );
      if (data) return data as LevelData;
    } catch {
      // fallback to local data
    }
  }

  if (levelId === "level1") return level1;
  if (levelId === "level2") return level2;
  if (levelId === "level3") return level3;

  throw new Error(`Level not found: ${levelId}`);
}



import level4 from "@/data/levels/level4";

export async function getLevel4() {
  return level4;
}
