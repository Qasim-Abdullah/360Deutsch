"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import type { User } from "@/types/user";

export default function AuthSync({ user }: { user: User | null }) {
  const { setUser } = useAuth();

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}