"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Objective } from "@/features/objectives/types/objective";

type DrawerState = {
  open: boolean;
  instanceKey: number;
  initialObjective?: Partial<Objective>;
  isDuplicate?: boolean;
};

type ObjectiveFormDrawerContextType = {
  drawer: DrawerState;
  openDrawer: (params?: { initialObjective?: Partial<Objective>; isDuplicate?: boolean }) => void;
  closeDrawer: () => void;
};

const ObjectiveFormDrawerContext = createContext<ObjectiveFormDrawerContextType | undefined>(undefined);

export function ObjectiveFormDrawerProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, instanceKey: 0 });

  const openDrawer = (params?: { initialObjective?: Partial<Objective>; isDuplicate?: boolean }) => {
    setDrawer((current) => ({ open: true, instanceKey: current.instanceKey + 1, ...params }));
  };

  const closeDrawer = () => setDrawer((current) => ({ open: false, instanceKey: current.instanceKey }));

  return (
    <ObjectiveFormDrawerContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </ObjectiveFormDrawerContext.Provider>
  );
}

export function useObjectiveFormDrawer() {
  const ctx = useContext(ObjectiveFormDrawerContext);
  if (!ctx) throw new Error("useObjectiveFormDrawer must be used within ObjectiveFormDrawerProvider");
  return ctx;
}
