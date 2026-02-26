export type LevelStatus = 'completed' | 'active' | 'locked';

export interface RoadmapLevel {
  id: number;
  title: string;
  subtitle: string;
  status: LevelStatus;
}
