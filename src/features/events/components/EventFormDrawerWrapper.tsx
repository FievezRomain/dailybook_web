import { useEventFormDrawer } from "@/features/events/context/event-form-drawer-context";
import { EventFormDrawer } from "./EventFormDrawer";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { attachEventDocument, deleteEventDocument } from "@/features/events/api/events-api";
import type { CreateEventInput, Event, UpdateEventInput } from "@/features/events/types/event";
import type { RecurrenceScope } from '@/features/events/types/event';
import { useGroupsQuery } from '@/features/groups/hooks/use-groups';

const text = (value: unknown) => value === undefined ? undefined : value === null || String(value).trim() === '' ? null : String(value).trim();
const number = (value: unknown) => value === undefined ? undefined : value === null || value === '' ? null : Number(value);

function eventInput(data: Partial<Event>) {
  return {
    nom: String(data.nom ?? '').trim(), dateevent: String(data.dateevent ?? ''), animaux: data.animaux ?? [],
    eventtype: String(data.eventtype ?? '').trim(), state: String(data.state || 'À faire'),
    heuredebutevent: text(data.heuredebutevent), lieu: text(data.lieu), specialiste: text(data.specialiste),
    depense: number(data.depense), categoriedepense: text(data.categoriedepense),
    rappelnotification: text(data.rappelnotification),
    heuredebutbalade: text(data.heuredebutbalade), datefinbalade: text(data.datefinbalade),
    heurefinbalade: text(data.heurefinbalade), discipline: text(data.discipline), note: number(data.note),
    epreuve: text(data.epreuve), dossart: text(data.dossart), placement: text(data.placement),
    traitement: text(data.traitement), datefinsoins: text(data.datefinsoins), commentaire: text(data.commentaire),
    todisplay: data.todisplay ?? true,
    frequencetype: data.frequencevalue ? 'recurring' : null,
    frequencevalue: data.frequencevalue ? text(data.frequencevalue) : null,
    idparent: data.idparent, documents: (data.documents ?? []).map((document) => document.name),
    shared_groups: (data.shared_groups ?? []).map((group) => group.id),
  };
}

export function EventFormDrawerWrapper() {
  const { drawer, closeDrawer } = useEventFormDrawer();
  const { createEvent, updateEvent, refetch, isMutating } = useEventsQuery();
  const { user, isPremium } = useCurrentUser();
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimalsQuery();
  const { groups, isLoading: isLoadingGroups } = useGroupsQuery();

  async function handleSubmit(data: Partial<Event>, removedDocuments: string[], updateScope: RecurrenceScope) {
    try {
      const input = eventInput(data);
      if (drawer.isDuplicate || !data.id) {
        await createEvent(input as CreateEventInput);
        toast.success("Événement créé avec succès.");
      } else {
        await updateEvent(data.id, { ...input, update_scope: updateScope } as UpdateEventInput);
        const initialDocuments = new Set((drawer.initialEvent?.documents ?? []).map((document) => document.name));
        const addedDocuments = input.documents.filter((filename) => !initialDocuments.has(filename));
        await Promise.all(addedDocuments.map((filename) => attachEventDocument(data.id!, filename)));
        await Promise.all(removedDocuments.map((filename) => deleteEventDocument(data.id!, filename)));
        if (removedDocuments.length) await refetch();
        toast.success("Événement mis à jour avec succès.");
      }
      closeDrawer();
    } catch (e) {
      Sentry.captureException(e, {
        extra: {
          data,
          isDuplicate: drawer.isDuplicate,
          userId: user?.id,
        }
      });
      console.error(e);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <EventFormDrawer
      key={drawer.instanceKey}
      open={drawer.open}
      initialEvent={drawer.initialEvent}
      isDuplicate={drawer.isDuplicate}
      animals={isLoadingAnimals || !animals ? undefined : animals}
      groups={isLoadingGroups || !groups ? undefined : groups}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      onUpdateAnimalImage={updateAnimalImage}
      isPremium={isPremium}
      isSubmitting={isMutating}
    />
  );
}
