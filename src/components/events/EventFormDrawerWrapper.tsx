import { useEventFormDrawer } from "@/context/EventFormDrawerContext";
import { EventFormDrawer } from "./EventFormDrawer";
import { useEvents } from "@/context/EventContext";
import { useUserContext } from "@/context/UserContext";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { isEventComplete } from "@/utils/eventsUtils";
import { useAnimals } from "@/context/AnimalContext";

export function EventFormDrawerWrapper() {
  const { drawer, closeDrawer } = useEventFormDrawer();
  const { addEvent, updateEvent } = useEvents();
  const { user } = useUserContext();
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimals();

  async function handleSubmit(data: any) {
    try {
      if (drawer.isDuplicate || !data.id) {
        // Création
        await addEvent(data);
        toast.success("Événement créé avec succès.");
      } else {
        // Modification
        if (isEventComplete(data)) {
          await updateEvent(data.id, data);
          toast.success("Événement mis à jour avec succès.");
        } else {
          throw new Error("Tentative de modification avec un événement incomplet");
        }
      }
      closeDrawer();
    } catch (e) {
      Sentry.captureException(e, {
        extra: {
          data,
          isDuplicate: drawer.isDuplicate,
          userId: user?.uid,
        }
      });
      console.error(e);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <EventFormDrawer
      open={drawer.open}
      initialEvent={drawer.initialEvent}
      isDuplicate={drawer.isDuplicate}
      animals={isLoadingAnimals || !animals ? undefined : animals}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      onUpdateAnimalImage={updateAnimalImage}
    />
  );
}