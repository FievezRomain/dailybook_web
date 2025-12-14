import { createContext, useContext, useState, ReactNode } from "react";
import { Objective } from "@/types/objective";

type DrawerState = {
  open: boolean;
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
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });

  const openDrawer = (params?: { initialObjective?: Partial<Objective>; isDuplicate?: boolean }) => {
    setDrawer({ open: true, ...params });
  };

  const closeDrawer = () => setDrawer({ open: false });

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