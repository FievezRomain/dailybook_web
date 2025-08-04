'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { mapEvents } from "@/utils/eventsUtils";
import { Event, MappedEvent } from "@/types/event";

type EventContextType = {
  events: MappedEvent[] | undefined;
  isLoading: boolean;
  isError: any;
  addEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refresh: () => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/events", fetcher);

  // Mappe les events dès la récupération
  const events: MappedEvent[] | undefined = data ? mapEvents(data) : undefined;

  // CRUD
  const addEvent = async (event: Partial<Event>) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    await mutate(); // revalide
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    await mutate();
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await mutate();
  };

  const refresh = () => mutate();

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        isError: error,
        addEvent,
        updateEvent,
        deleteEvent,
        refresh,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
}