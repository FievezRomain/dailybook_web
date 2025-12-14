import { createContext, useContext, useState, ReactNode } from "react";
import { MappedEvent } from "@/types/event";
import { useEvents } from "@/context/EventContext";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type EventDeleteContextType = {
  openDelete: (event: MappedEvent) => void;
};

const EventDeleteContext = createContext<EventDeleteContextType | undefined>(undefined);

export function EventDeleteProvider({ children }: { children: ReactNode }) {
  const [eventToDelete, setEventToDelete] = useState<MappedEvent | null>(null);
  const { deleteEvent } = useEvents();

  const openDelete = (event: MappedEvent) => setEventToDelete(event);
  const closeDelete = () => setEventToDelete(null);

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete.id);
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
        description="Voulez-vous vraiment supprimer cet événement ?"
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