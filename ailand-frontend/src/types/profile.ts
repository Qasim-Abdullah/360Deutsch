
export type ProfileApiResponse = {
  id: number;
  username: string;
  email: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  member_since?: string | null;
  level?: string | null;
  status?: string | null;
  role?: string | null;
  plan_id?: number | null;
};


export type ProfileUpdatePayload = {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
};

export type ProfileUser = {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  plan_id?: number;
  avatarUrl?: string;
  status?: string;
  level?: string;
  memberSince?: string;
  bio?: string;
};
