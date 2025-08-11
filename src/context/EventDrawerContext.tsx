import { createContext, useContext, useState, ReactNode } from "react";
import type { MappedEvent } from "@/types/event";

type DrawerState = {
  open: boolean;
  event?: MappedEvent | null;
};

type EventDrawerContextType = {
  drawer: DrawerState;
  openDrawer: (event: MappedEvent) => void;
  closeDrawer: () => void;
};

const EventDrawerContext = createContext<EventDrawerContextType | undefined>(undefined);

export function EventDrawerProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, event: null });

  const openDrawer = (event: MappedEvent) => setDrawer({ open: true, event });
  const closeDrawer = () => setDrawer({ open: false, event: null });

  return (
    <EventDrawerContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </EventDrawerContext.Provider>
  );
}

export function useEventDrawer() {
  const ctx = useContext(EventDrawerContext);
  if (!ctx) throw new Error("useEventDrawer must be used within EventDrawerProvider");
  return ctx;
}