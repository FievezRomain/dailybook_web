'use client';

import { createContext, useContext } from "react";
import { useEventsData } from "@/hooks/useEventsData";
import * as eventService from "@/services/events";
import * as Sentry from "@sentry/react";
import { Event } from "@/types/event";

type EventContextType = {
  events: Event[] | undefined;
  isLoading: boolean;
  isError: any;
  addEvent: (event: Partial<Event>) => Promise<void>;
  updateEvent: (id: number, event: Event) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  refresh: () => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { events, isLoading, isError, mutate } = useEventsData();

  const addEvent = async (event: Partial<Event>) => {
    try {
      await eventService.createEvent(event);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de l'événement");
    }
  };

  const updateEvent = async (id: number, event: Event) => {
    try {
      await eventService.updateEvent(id, event);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de l'événement");
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      await eventService.deleteEvent(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression de l'événement");
    }
  };

  const refresh = () => mutate();

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        isError,
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