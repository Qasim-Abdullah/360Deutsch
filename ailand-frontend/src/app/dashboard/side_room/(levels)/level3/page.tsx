import { getLevel } from "@/lib/api/levels";
import { missionsFromLevelData } from "@/data/levels/level3";
import Level3Client from "./Level3Client";

export default async function Level3Page() {
  const levelData = await getLevel("level3");
  const words = levelData.tasks[0]?.words ?? [];
  const missions = missionsFromLevelData(words);

  return <Level3Client missions={missions} />;
}
