'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Objective } from "@/types/objective";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ObjectiveProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/objectives", fetcher);

  const objectives: Objective[] | undefined = data;

  const addObjective = async (objective: Partial<Objective>) => {
    await fetch("/api/objectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objective),
    });
    await mutate();
  };

  const updateObjective = async (id: string, objective: Partial<Objective>) => {
    await fetch(`/api/objectives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(objective),
    });
    await mutate();
  };

  const deleteObjective = async (id: string) => {
    await fetch(`/api/objectives/${id}`, { method: "DELETE" });
    await mutate();
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