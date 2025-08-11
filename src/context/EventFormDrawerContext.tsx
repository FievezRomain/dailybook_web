import { createContext, useContext, useState, ReactNode } from "react";
import type { Event } from "@/types/event";

type DrawerState = {
  open: boolean;
  initialEvent?: Partial<Event>;
  isDuplicate?: boolean;
};

type EventFormDrawerContextType = {
  drawer: DrawerState;
  openDrawer: (params?: { initialEvent?: Partial<Event>; isDuplicate?: boolean }) => void;
  closeDrawer: () => void;
};

const EventFormDrawerContext = createContext<EventFormDrawerContextType | undefined>(undefined);

export function EventFormDrawerProvider({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState>({ open: false });

  const openDrawer = (params?: { initialEvent?: Partial<Event>; isDuplicate?: boolean }) => {
    setDrawer({ open: true, ...params });
  };

  const closeDrawer = () => setDrawer({ open: false });

  return (
    <EventFormDrawerContext.Provider value={{ drawer, openDrawer, closeDrawer }}>
      {children}
    </EventFormDrawerContext.Provider>
  );
}

export function useEventFormDrawer() {
  const ctx = useContext(EventFormDrawerContext);
  if (!ctx) throw new Error("useEventFormDrawer must be used within EventFormDrawerProvider");
  return ctx;
}