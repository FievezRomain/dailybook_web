'use client';

import { createContext, useContext } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type User = {
  name: string;
  email: string;
  uid: string;
  isPremium: boolean;
};

type UserContextType = {
  user: User | undefined;
  isLoading: boolean;
  isError: any;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useCurrentUser();

  return (
    <UserContext.Provider value={{ user, isLoading, isError }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
}