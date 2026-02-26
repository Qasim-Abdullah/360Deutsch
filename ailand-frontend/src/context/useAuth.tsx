"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import type { User } from "@/types/user";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export function AuthProvider({
  children,
  initialUser,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);

  const value = useMemo(
    () => ({ user, setUser }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be inside AuthProvider");
  }

  return context;
}