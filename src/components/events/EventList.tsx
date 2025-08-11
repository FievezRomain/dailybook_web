"use client";

import { Event, MappedEvent } from "@/types/event";
import { EventCard } from "./EventCard";
import { mapEvents } from "@/utils/eventsUtils";
import useSWR from "swr";
import { getAnimals } from "@/api/animals";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";
import { useUserContext } from "@/context/UserContext";
import { filterAndEnrichAnimals } from "@/utils/animalsUtils";
import { useEventFormDrawer } from "@/context/EventFormDrawerContext";
import { useEventDrawer } from "@/context/EventDrawerContext";
import { useEventDelete } from "@/context/EventDeleteContext";

export const EventList = ({ events }: { events: Event[] }) => {
  // Si la liste des événements est vide, affiche un message
  if (events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement</p>;
  }

  // Récupère l'utilisateur depuis le context
  const { user, isLoading: isLoadingUser } = useUserContext(); 

  // Récupération des animaux
  const { data: animals, isLoading: isLoadingAnimals } = useSWR(['animals'], () => getAnimals());

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

  // Si l'utilisateur est en cours de chargement, affiche des skeletons
  if (isLoadingUser) {
    return (
      <div className="space-y-4">
        {events.map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Liste des cards */}
      {enrichedEvents.map((event) => (
        <div key={event.id} className="py-2">
          <EventCard
            event={event}
            animals={isLoadingAnimals || !user || !animals ? undefined : filterAndEnrichAnimals(event, animals, user.uid)}
            onComplete={() => console.log("tâche effectuée")}
            onDelete={() => openDelete(event)}
            onEdit={() => handleEdit(event)}
            onDuplicate={() => handleDuplicate(event)}
            onOpenDrawer={() => openDrawerDetail(event)}
          />
        </div>
      ))}
    </div>
  );
};
