"use client";

import type { Event, MappedEvent } from "@/features/events/types/event";
import { mapEvents } from "@/features/events/utils/events";
import { useMemo } from "react";
import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import { useEventDrawer } from "@/features/events/context/event-drawer-context";
import { useEventDelete } from "@/features/events/context/event-delete-context";
import { EventCardWrapper } from "./EventCardWrapper";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { toast } from "sonner";

export const EventList = ({ events, strikeCompleted = false }: { events: Event[]; strikeCompleted?: boolean }) => {
  // Récupération des animaux
  const { animals, updateAnimalImage } = useAnimalsQuery();

  // Récupération des fonctions du context
  const { patchEvent } = useEventsQuery({}, false);

  // Gestion de l'ouverture du drawer de visualisation d'event
  const { openDrawer: openDrawerDetail } = useEventDrawer();

  // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
  const { openDelete } = useEventDelete();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useEventFormDrawer();

  // Récupération des événements enrichis
  const enrichedEvents = useMemo(() => mapEvents(events), [events]);

  if (events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement</p>;
  }

  // Ouvre le drawer pour édition via le context
  const handleEdit = (event: MappedEvent) => {
    openDrawerForm({ initialEvent: event });
  };

  // Ouvre le drawer pour duplication via le context
  const handleDuplicate = (event: MappedEvent) => {
    openDrawerForm({ initialEvent: event, isDuplicate: true });
  };

  const handleStateChange = async (id: number, event: Event) => {
    try {
      await patchEvent(id, { state: event.state });
      toast.success("Événement mis à jour avec succès.");
    } catch {
      toast.error("La mise à jour de l’événement a échoué.");
    }
  };

  return (
    <div className="space-y-2.5" role="list" aria-label="Liste des événements">
      {enrichedEvents.map((event) => (
        <div key={event.id} role="listitem">
          <EventCardWrapper
            event={event}
            animals={animals}
            onComplete={handleStateChange}
            onDelete={() => openDelete(event)}
            onEdit={() => handleEdit(event)}
            onDuplicate={() => handleDuplicate(event)}
            onUpdateAnimalImage={updateAnimalImage}
            onOpenDrawer={() => openDrawerDetail(event)}
            strikeCompleted={strikeCompleted}
          />
        </div>
      ))}
    </div>
  );
};
