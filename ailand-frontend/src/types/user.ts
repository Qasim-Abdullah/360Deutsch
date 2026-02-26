export type UserRole = "user" | "admin";

export type ThemeMode = "light" | "dark";

export type PlanId = "free" | "pro" | "ultra";

export type Progress = {
  currentRoomId: string;
  unlockedRooms: string[];
};

export type User = {
  id: string;
  username: string;
  daily_streak: number;
  points: number;
  avatar_url: string;
  role: UserRole;
  email: string;
  theme: ThemeMode;
  planId: PlanId;
  progress: Progress;
  level?: string;
  status?: string;
  memberSince?: Date;
  bio?: string;
};
