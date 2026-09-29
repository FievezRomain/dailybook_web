"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Animal } from "@/features/animals/types/animal";

type DrawerState = {
  open: boolean;
  instanceKey: number;
  initialAnimal?: Partial<Animal>;
  isEdit?: boolean;
};

type AnimalFormDrawerContextType = {
  drawer: DrawerState;
  openDrawer: (params?: { initialAnimal?: Partial<Animal>; isEdit?: boolean }) => void;
  closeDrawer: () => void;
};

const AnimalFormDrawerContext = createContext<AnimalFormDrawerContextType | undefined>(undefined);

export function AnimalFormDrawerProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, instanceKey: 0 });

  const openDrawer = (params?: { initialAnimal?: Partial<Animal>; isEdit?: boolean }) => {
    setDrawer((current) => ({ open: true, instanceKey: current.instanceKey + 1, ...params }));
  };

  const closeDrawer = () => setDrawer((current) => ({ open: false, instanceKey: current.instanceKey }));

  return (
    <AnimalFormDrawerContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </AnimalFormDrawerContext.Provider>
  );
}

export function useAnimalFormDrawer() {
  const ctx = useContext(AnimalFormDrawerContext);
  if (!ctx) throw new Error("useAnimalFormDrawer must be used within AnimalFormDrawerProvider");
  return ctx;
}
