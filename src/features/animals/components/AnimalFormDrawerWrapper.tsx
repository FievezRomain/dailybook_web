import { useAnimalFormDrawer } from "@/features/animals/context/animal-form-drawer-context";
import { AnimalFormDrawer } from "./AnimalFormDrawer";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import type { Animal, CreateAnimalInput, UpdateAnimalInput } from "@/features/animals/types/animal";

function optionalText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function optionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toAnimalInput(data: Partial<Animal>): UpdateAnimalInput {
  return {
    nom: optionalText(data.nom), espece: optionalText(data.espece), datenaissance: optionalText(data.datenaissance),
    race: optionalText(data.race), taille: optionalNumber(data.taille), poids: optionalNumber(data.poids),
    sexe: optionalText(data.sexe), food: optionalText(data.food), quantity: optionalNumber(data.quantity),
    unity: optionalText(data.unity), couleur: optionalText(data.couleur), nompere: optionalText(data.nompere),
    nommere: optionalText(data.nommere), image: data.image, numeroidentification: optionalText(data.numeroidentification),
    informations: optionalText(data.informations), datearrivee: optionalText(data.datearrivee),
    datedepart: optionalText(data.datedepart), datedeces: optionalText(data.datedeces),
  };
}

function changedAnimalInput(input: UpdateAnimalInput, initial: Partial<Animal>): UpdateAnimalInput {
  const normalizedInitial = toAnimalInput(initial);
  const changed = Object.fromEntries(
    Object.entries(input).filter(([key, value]) => value !== normalizedInitial[key as keyof UpdateAnimalInput]),
  ) as UpdateAnimalInput;
  if ('unity' in changed && !('quantity' in changed)) changed.quantity = input.quantity;
  if ('quantity' in changed && !('unity' in changed)) changed.unity = input.unity;
  return changed;
}

export function AnimalFormDrawerWrapper() {
  const { drawer, closeDrawer } = useAnimalFormDrawer();
  const { createAnimal, updateAnimal, isMutating } = useAnimalsQuery();

  async function handleSubmit(data: Partial<Animal>, imageFile?: File) {
    try {
      const input = toAnimalInput(data);
      if (drawer.initialAnimal?.id) {
        const changed = changedAnimalInput(input, drawer.initialAnimal);
        if (Object.keys(changed).length > 0 || imageFile) {
          await updateAnimal(drawer.initialAnimal.id, changed, imageFile);
        }
        toast.success("Animal modifié avec succès.");
      } else {
        const createInput = { ...input };
        delete createInput.datedeces;
        await createAnimal(createInput as CreateAnimalInput, imageFile);
        toast.success("Animal ajouté avec succès.");
      }
      closeDrawer();
    } catch (e) {
      Sentry.captureException(e, {
        extra: { data, isEdit: drawer.isEdit },
      });
      console.error(e);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <AnimalFormDrawer
      key={drawer.instanceKey}
      open={drawer.open}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      isSubmitting={isMutating}
      initialAnimal={drawer.initialAnimal}
    />
  );
}
