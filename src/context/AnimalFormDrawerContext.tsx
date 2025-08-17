import { createContext, useContext, useState, ReactNode } from "react";
import type { Animal } from "@/types/animal";

type DrawerState = {
  open: boolean;
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
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });

  const openDrawer = (params?: { initialAnimal?: Partial<Animal>; isEdit?: boolean }) => {
    setDrawer({ open: true, ...params });
  };

  const closeDrawer = () => setDrawer({ open: false });

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