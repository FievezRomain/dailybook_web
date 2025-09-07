'use client';

import { createContext, useContext } from "react";
import { useObjectivesData } from "@/hooks/useObjectivesData";
import * as objectiveService from "@/services/objectifs";
import * as Sentry from "@sentry/react";
import { Objective } from "@/types/objective";

type ObjectiveContextType = {
  objectives: Objective[] | undefined;
  isLoading: boolean;
  isError: any;
  addObjective: (objective: Partial<Objective>) => Promise<void>;
  updateObjective: (id: number, objective: Partial<Objective>) => Promise<void>;
  deleteObjective: (id: number) => Promise<void>;
  refresh: () => void;
};

const ObjectiveContext = createContext<ObjectiveContextType | undefined>(undefined);

export function ObjectiveProvider({ children }: { children: React.ReactNode }) {
  const { objectives, isLoading, isError, mutate } = useObjectivesData();

  const addObjective = async (objective: Partial<Objective>) => {
    try {
      await objectiveService.addObjectifs(objective);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de l'objectif");
    }
  };

  const updateObjective = async (id: number, objective: Partial<Objective>) => {
    try {
      await objectiveService.updateObjectifs(id, objective);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de l'objectif");
    }
  };

  const deleteObjective = async (id: number) => {
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
        isError,
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