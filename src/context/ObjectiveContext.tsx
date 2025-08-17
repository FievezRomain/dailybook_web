'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Objective } from "@/types/objective";
import * as objectiveService from "@/services/objectifs";
import * as Sentry from "@sentry/react";

type ObjectiveContextType = {
  objectives: Objective[] | undefined;
  isLoading: boolean;
  isError: any;
  addObjective: (objective: Partial<Objective>) => Promise<void>;
  updateObjective: (id: string, objective: Partial<Objective>) => Promise<void>;
  deleteObjective: (id: string) => Promise<void>;
  refresh: () => void;
};

const ObjectiveContext = createContext<ObjectiveContextType | undefined>(undefined);

const fetcher = async () => {
  return await objectiveService.getObjectifs();
};

export function ObjectiveProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/objectives", fetcher);

  const objectives: Objective[] | undefined = data;

  const addObjective = async (objective: Partial<Objective>) => {
    try {
      await objectiveService.addObjectifs(objective as any);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de l'objectif");
    }
  };

  const updateObjective = async (id: string, objective: Partial<Objective>) => {
    try {
      await objectiveService.updateObjectifs(id, objective);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de l'objectif");
    }
  };

  const deleteObjective = async (id: string) => {
    try {
      await objectiveService.deleteObjectifs(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression de l'objectif");
    }
  };

  const refresh = () => mutate();

  return (
    <ObjectiveContext.Provider
      value={{
        objectives,
        isLoading,
        isError: error,
        addObjective,
        updateObjective,
        deleteObjective,
        refresh,
      }}
    >
      {children}
    </ObjectiveContext.Provider>
  );
}

export function useObjectives() {
  const ctx = useContext(ObjectiveContext);
  if (!ctx) throw new Error("useObjectives must be used within ObjectiveProvider");
  return ctx;
}