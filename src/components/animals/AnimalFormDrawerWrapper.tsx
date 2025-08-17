import { useAnimalFormDrawer } from "@/context/AnimalFormDrawerContext";
import { AnimalFormDrawer } from "./AnimalFormDrawer";
import { useAnimals } from "@/context/AnimalContext";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { Animal } from "@/types/animal";
import { getPresignedUrl, uploadToStorage, deleteFromStorage } from "@/services/storage";

export function AnimalFormDrawerWrapper() {
  const { drawer, closeDrawer } = useAnimalFormDrawer();
  const { addAnimal, updateAnimal, refresh } = useAnimals();

  async function handleSubmit(data: Partial<Animal>, imageFile?: File) {
    let imageName = data.image;
    try {
      // Suppression S3 si demandé
      if (drawer.initialAnimal?.image && data.image === undefined) {
        await deleteFromStorage(drawer.initialAnimal.image);
        imageName = undefined;
      }

      // Upload image si sélectionnée
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s/g, "_")}`;
        const presignedUrl = await getPresignedUrl(fileName, imageFile.type, "animal");
        await uploadToStorage(imageFile, presignedUrl);
        imageName = fileName;
      }

      // Création ou modification
      if (drawer.initialAnimal?.id) {
        await updateAnimal(drawer.initialAnimal.id, { ...data, image: imageName });
        toast.success("Animal modifié avec succès.");
      } else {
        await addAnimal({ ...data, image: imageName });
        toast.success("Animal ajouté avec succès.");
      }
      refresh();
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
      open={drawer.open}
      onClose={closeDrawer}
      onSubmit={handleSubmit}
      isSubmitting={false}
      initialAnimal={drawer.initialAnimal}
    />
  );
}