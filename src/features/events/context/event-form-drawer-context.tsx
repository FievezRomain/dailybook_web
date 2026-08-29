"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Event } from "@/features/events/types/event";

type DrawerState = {
  open: boolean;
  instanceKey: number;
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
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, instanceKey: 0 });

  const openDrawer = (params?: { initialEvent?: Partial<Event>; isDuplicate?: boolean }) => {
    setDrawer((current) => ({ open: true, instanceKey: current.instanceKey + 1, ...params }));
  };

  const closeDrawer = () => setDrawer((current) => ({ open: false, instanceKey: current.instanceKey }));

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
