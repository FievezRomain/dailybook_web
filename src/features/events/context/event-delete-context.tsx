"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MappedEvent } from "@/features/events/types/event";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import type { RecurrenceScope } from '../types/event';
import { RecurrenceScopeSelector } from '../components/RecurrenceScopeSelector';

type EventDeleteContextType = {
  openDelete: (event: MappedEvent) => void;
};

const EventDeleteContext = createContext<EventDeleteContextType | undefined>(undefined);

export function EventDeleteProvider({ children }: { children: ReactNode }) {
  const [eventToDelete, setEventToDelete] = useState<MappedEvent | null>(null);
  const [deleteScope, setDeleteScope] = useState<RecurrenceScope>('occurrence');
  const { deleteEvent } = useEventsQuery({}, false);

  const openDelete = (event: MappedEvent) => {
    setDeleteScope('occurrence');
    setEventToDelete(event);
  };
  const closeDelete = () => setEventToDelete(null);

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id, deleteScope);
        toast.success("Événement supprimé avec succès.");
      } catch (error) {
        Sentry.captureException(error, {
          extra: { eventId: eventToDelete.id }
        });
        toast.error("Une erreur est survenue lors de la suppression de l'événement.");
      }
      setEventToDelete(null);
    }
  };

  return (
    <EventDeleteContext.Provider value={{ openDelete }}>
      {children}
      <ConfirmDialog
        open={!!eventToDelete}
        title="Confirmer la suppression"
        description={eventToDelete && (eventToDelete.idparent || eventToDelete.frequencevalue) ? (
          <RecurrenceScopeSelector value={deleteScope} onChange={setDeleteScope} />
        ) : "Voulez-vous vraiment supprimer cet événement ?"}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
      />
    </EventDeleteContext.Provider>
  );
}

export function useEventDelete() {
  const ctx = useContext(EventDeleteContext);
  if (!ctx) throw new Error("useEventDelete must be used within EventDeleteProvider");
  return ctx;
}
