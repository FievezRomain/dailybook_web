import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { useObjectiveFormDrawer } from "@/features/objectives/context/objective-form-drawer-context";
import { ObjectiveFormDrawer } from "./ObjectiveFormDrawer";
import { useObjectivesQuery } from "@/features/objectives/hooks/use-objectives";
import type { CreateObjectiveInput, UpdateObjectiveInput } from "@/features/objectives/types/objective";
import type { ObjectiveFormValue } from "@/features/objectives/hooks/use-objective-form";

function objectiveInput(data: ObjectiveFormValue, duplicate: boolean) {
  return {
    title: String(data.title ?? '').trim(),
    temporalityobjectif: data.temporalityobjectif?.trim() || null,
    datedebut: data.datedebut || null,
    datefin: data.datefin || null,
    animaux: data.animaux ?? [],
    sousetapes: (data.sousetapes ?? [])
      .filter((subtask) => subtask.etape.trim())
      .map((subtask, index) => ({
        ...(duplicate || subtask.id === undefined ? {} : { id: subtask.id }),
        etape: subtask.etape.trim(),
        state: duplicate ? false : subtask.state,
        order: index + 1,
      })),
  };
}

export function ObjectiveFormDrawerWrapper() {
  const { drawer, closeDrawer } = useObjectiveFormDrawer();
  const { createObjective, updateObjective, isMutating } = useObjectivesQuery();
  const { user } = useCurrentUser();
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimalsQuery();

  async function handleSubmit(data: ObjectiveFormValue) {
    try {
      const input = objectiveInput(data, Boolean(drawer.isDuplicate));
      if (drawer.isDuplicate || !data.id) {
        await createObjective(input as CreateObjectiveInput);
        toast.success("Objectif créé avec succès.");
      } else {
        // Modification
        await updateObjective(data.id, { ...input, id: data.id } as UpdateObjectiveInput);
        toast.success("Objectif mis à jour avec succès.");
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
    <ObjectiveFormDrawer
      key={drawer.instanceKey}
      open={drawer.open}
      initialObjective={drawer.initialObjective}
      isDuplicate={drawer.isDuplicate}
      animals={isLoadingAnimals || !animals ? undefined : animals}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      onUpdateAnimalImage={updateAnimalImage}
      isSubmitting={isMutating}
    />
  );
}
