"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { MappedEvent } from "@/features/events/types/event";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import type { RecurrenceScope } from '../types/event';

type EventDeleteContextType = {
  openDelete: (event: MappedEvent) => void;
};

const EventDeleteContext = createContext<EventDeleteContextType | undefined>(undefined);

export function EventDeleteProvider({ children }: { children: ReactNode }) {
  const [eventToDelete, setEventToDelete] = useState<MappedEvent | null>(null);
  const [deleteScope, setDeleteScope] = useState<RecurrenceScope>('occurrence');
  const { deleteEvent } = useEventsQuery();

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
          <fieldset className="grid gap-2">
            <legend className="mb-1 font-medium">Choisissez la portée avant de supprimer :</legend>
            {([
              ['occurrence', 'Cette occurrence uniquement'],
              ['following', 'Cette occurrence et les suivantes'],
              ['series', 'Toute la série'],
            ] as const).map(([scope, label]) => (
              <label key={scope} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2">
                <input type="radio" name="delete-scope" value={scope} checked={deleteScope === scope}
                  onChange={() => setDeleteScope(scope)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
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
