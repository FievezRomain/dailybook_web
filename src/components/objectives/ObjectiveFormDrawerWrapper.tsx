import { useUserContext } from "@/context/UserContext";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { useAnimals } from "@/context/AnimalContext";
import { useObjectiveFormDrawer } from "@/context/ObjectiveFormDrawerContext";
import { ObjectiveFormDrawer } from "./ObjectiveFormDrawer";
import { useObjectives } from "@/context/ObjectiveContext";

export function ObjectiveFormDrawerWrapper() {
  const { drawer, closeDrawer } = useObjectiveFormDrawer();
  const { addObjective, updateObjective } = useObjectives();
  const { user } = useUserContext();
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimals();

  async function handleSubmit(data: any) {
    try {
      if (drawer.isDuplicate || !data.id) {
        // Création
        await addObjective(data);
        toast.success("Objectif créé avec succès.");
      } else {
        // Modification
        await updateObjective(data.id, data);
        toast.success("Objectif mis à jour avec succès.");
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
    <ObjectiveFormDrawer
      open={drawer.open}
      initialObjective={drawer.initialObjective}
      animals={isLoadingAnimals || !animals ? undefined : animals}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      onUpdateAnimalImage={updateAnimalImage}
    />
  );
}