'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Group } from "@/types/group";
import * as groupService from "@/services/groups";
import * as Sentry from "@sentry/react";

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

const fetcher = async () => {
  return await groupService.getGroups();
};

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/groups", fetcher);

  const groups: Group[] | undefined = data;

  const addGroup = async (group: Partial<Group>) => {
    try {
      await groupService.addGroup(group as any);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du groupe");
    }
  };

  const updateGroup = async (id: string, group: Partial<Group>) => {
    try {
      await groupService.updateGroup(id, group);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du groupe");
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await groupService.deleteGroup(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression du groupe");
    }
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