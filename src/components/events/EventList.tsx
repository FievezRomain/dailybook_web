import { Event, MappedEvent } from "@/types/event";
import { EventCard } from "./EventCard";
import { mapEvents } from "@/utils/eventsUtils";
import useSWR from "swr";
import { getAnimals } from "@/api/animals";
import { getFileUrl } from "@/utils/s3Utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "../ui/skeleton";
import { useState, useMemo } from "react";
import { EventDrawer } from "./EventDrawer";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EventFormDrawer } from "./EventFormDrawer";
import { Animal } from "@/types/animal";

export const EventList = ({ events }: { events: Event[] }) => {
  if (events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement</p>;
  }

  // Récupère l'utilisateur actuel et les animaux
  // pour enrichir les événements avec les données nécessaires
  const { user, isLoading: isLoadingUser, isError } = useCurrentUser(); 
  const { data: animals, isLoading: isLoadingAnimals } = useSWR(['animals'], () => getAnimals());
  
  // Pour gérer l'état de l'événement sélectionné
  // et de l'événement à supprimer
  const [selectedEvent, setSelectedEvent] = useState<MappedEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<MappedEvent | null>(null);

  // Pour gérer l'ouverture du drawer de visualisation
  // et la fermeture de celui-ci
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pour gérer l'ouverture du drawer de formulaire
  // et la distinction entre édition et duplication
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Enrichit les événements avec les animaux liés
  // et les autres données nécessaires
  const enrichedEvents = useMemo(() => mapEvents(events), [events]);

  // Fonction pour ouvrir le drawer de visualisation
  // d'un événement sélectionné
  const handleOpenDrawer = (event: MappedEvent) => {
    setDrawerOpen(true);
    setSelectedEvent(event);
  };

  // Fonction pour fermer le drawer de visualisation
  // et réinitialiser l'événement sélectionné
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedEvent(null);
  };

  // Filtre les animaux liés à l'événement
  // et enrichit leurs données avec l'URL de l'image
  const filterAndEnrichAnimals = (event:MappedEvent) => {
    const animalIds = new Set(event.animaux);
    
    const linkedAnimals = Array.isArray(animals)
    ? animals.reduce((acc, a) => {
        if (animalIds.has(a.id)) acc.push({
          ...a,
          image: a.image ? getFileUrl(a.image, user.uid) : undefined
        });
        return acc;
      }, [] as Animal[])
    : [];

    return linkedAnimals;
  }

  // Fonction pour confirmer la suppression d'un événement
  // et réinitialiser l'état de l'événement à supprimer
  const handleConfirmDelete = () => {
    if (eventToDelete) {
      setEventToDelete(null);
      if (selectedEvent?.id === eventToDelete.id) setSelectedEvent(null);
    }
  };

  // Prépare les données initiales pour le formulaire
  // en fonction de l'événement sélectionné et du mode (édition ou duplication)
  const formInitialEvent = useMemo(() => {
    if (!selectedEvent) return undefined;
    if (isDuplicate) {
      const { id, ...rest } = selectedEvent;
      return rest;
    }
    return selectedEvent;
  }, [selectedEvent, isDuplicate]);

  // Ouvre le drawer pour édition
  const handleEdit = (event: MappedEvent) => {
    setSelectedEvent(event);
    setIsDuplicate(false);
    setFormDrawerOpen(true);
  };

  // Ouvre le drawer pour duplication (pré-rempli, mais sans id)
  const handleDuplicate = (event: MappedEvent) => {
    setSelectedEvent(event);
    setIsDuplicate(true);
    setFormDrawerOpen(true);
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
      {/* Drawer de visualisation */}
      {drawerOpen && !!selectedEvent && (
        <EventDrawer
          open={drawerOpen && !!selectedEvent}
          onClose={handleCloseDrawer}
          event={selectedEvent}
          animals={isLoadingAnimals ? undefined : filterAndEnrichAnimals(selectedEvent)}
          onDelete={() => setEventToDelete(selectedEvent)}
        />
      )}

      {/* Drawer de formulaire (création/édition/duplication) */}
      {formDrawerOpen &&
        <EventFormDrawer
          open={formDrawerOpen}
          onClose={() => setFormDrawerOpen(false)}
          onSubmit={(data) => {
            // Ici, appelle ta logique de création ou modification
            // Si isDuplicate, c'est une création, sinon édition
            setFormDrawerOpen(false);
          }}
          initialEvent={formInitialEvent}
          isDuplicate={isDuplicate}
        />
      }

      {/* Liste des cards */}
      {enrichedEvents.map((event) => (
        <div key={event.id} className="py-2">
          <EventCard
            event={event}
            animals={isLoadingAnimals ? undefined : filterAndEnrichAnimals(event)}
            onComplete={() => console.log("tâche effectuée")}
            onDelete={() => setEventToDelete(event)}
            onEdit={() => handleEdit(event)}
            onDuplicate={() => handleDuplicate(event)}
            onOpenDrawer={handleOpenDrawer}
          />
        </div>
      ))}

      {/* Modale de confirmation */}
      {eventToDelete && 
        (
          <ConfirmDialog
            open={!!eventToDelete}
            title="Confirmer la suppression"
            description="Voulez-vous vraiment supprimer cet événement ?"
            onCancel={() => setEventToDelete(null)}
            onConfirm={handleConfirmDelete}
            confirmLabel="Supprimer"
          />
        )
      }
    </div>
  );
};
