"use client";

import { Event, MappedEvent } from "@/types/event";
import { mapEvents } from "@/utils/eventsUtils";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";
import { useUserContext } from "@/context/UserContext";
import { useEventFormDrawer } from "@/context/EventFormDrawerContext";
import { useEventDrawer } from "@/context/EventDrawerContext";
import { useEventDelete } from "@/context/EventDeleteContext";
import { EventCardWrapper } from "./EventCardWrapper";
import { useAnimals } from "@/context/AnimalContext";

export const EventList = ({ events }: { events: Event[] }) => {
  // Si la liste des événements est vide, affiche un message
  if (events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement</p>;
  }

  // Récupération des animaux
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimals();

  // Gestion de l'ouverture du drawer de visualisation d'event
  const { openDrawer: openDrawerDetail } = useEventDrawer();

  // Gestion de l'ouverture du dialog pour confirmer la suppression d'un event
  const { openDelete } = useEventDelete();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useEventFormDrawer();

  // Récupération des événements enrichis
  const enrichedEvents = useMemo(() => mapEvents(events), [events]);

  // Ouvre le drawer pour édition via le context
  const handleEdit = (event: MappedEvent) => {
    openDrawerForm({ initialEvent: event });
  };

  // Ouvre le drawer pour duplication via le context
  const handleDuplicate = (event: MappedEvent) => {
    openDrawerForm({ initialEvent: event, isDuplicate: true });
  };

  return (
    <div>
      {/* Liste des cards */}
      {enrichedEvents.map((event) => (
        <div key={event.id} className="py-2">
          <EventCardWrapper
            event={event}
            animals={animals}
            onComplete={() => console.log("tâche effectuée")}
            onDelete={() => openDelete(event)}
            onEdit={() => handleEdit(event)}
            onDuplicate={() => handleDuplicate(event)}
            onUpdateAnimalImage={updateAnimalImage}
            onOpenDrawer={() => openDrawerDetail(event)}
          />
        </div>
      ))}
    </div>
  );
};
