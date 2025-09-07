'use client';

import { createContext, useContext } from "react";
import { useGroupsData } from "@/hooks/useGroupsData";
import * as groupService from "@/services/groups";
import * as Sentry from "@sentry/react";
import { Group } from "@/types/group";

type GroupContextType = {
  groups: Group[] | undefined;
  isLoading: boolean;
  isError: any;
  addGroup: (group: Partial<Group>) => Promise<void>;
  updateGroup: (id: number, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  refresh: () => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { groups, isLoading, isError, mutate } = useGroupsData();

  const addGroup = async (group: Partial<Group>) => {
    try {
      await groupService.addGroup(group);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du groupe");
    }
  };

  const updateGroup = async (id: number, group: Partial<Group>) => {
    try {
      await groupService.updateGroup(id, group);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du groupe");
    }
  };

  const deleteGroup = async (id: number) => {
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
        isError,
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