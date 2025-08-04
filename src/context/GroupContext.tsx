'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Group } from "@/types/group";

type GroupContextType = {
  groups: Group[] | undefined;
  isLoading: boolean;
  isError: any;
  addGroup: (group: Partial<Group>) => Promise<void>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  refresh: () => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/groups", fetcher);

  const groups: Group[] | undefined = data;

  const addGroup = async (group: Partial<Group>) => {
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    });
    await mutate();
  };

  const updateGroup = async (id: string, group: Partial<Group>) => {
    await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    });
    await mutate();
  };

  const deleteGroup = async (id: string) => {
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    await mutate();
  };

  const refresh = () => mutate();

  return (
    <GroupContext.Provider
      value={{
        groups,
        isLoading,
        isError: error,
        addGroup,
        updateGroup,
        deleteGroup,
        refresh,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroups must be used within GroupProvider");
  return ctx;
}