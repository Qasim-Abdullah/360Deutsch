import { getLevel } from "@/lib/api/levels";
import Level2Client from "./Level2Client";

export default async function Level2Page() {
  const levelData = await getLevel("level2");
  const words = levelData.tasks[0]?.words ?? [];

  return <Level2Client words={words} />;
}
