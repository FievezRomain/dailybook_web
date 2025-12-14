import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Animal } from "@/types/animal";
import { useAnimals } from "./AnimalContext";

type AnimalDeleteContextType = {
  openDelete: (animal: Animal) => void;
};

const AnimalDeleteContext = createContext<AnimalDeleteContextType | undefined>(undefined);

export function AnimalDeleteProvider({ children }: { children: ReactNode }) {
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const { deleteAnimal } = useAnimals();

  const openDelete = (animal: Animal) => setAnimalToDelete(animal);
  const closeDelete = () => setAnimalToDelete(null);

  const handleConfirmDelete = async () => {
    if (animalToDelete) {
      try {
        await deleteAnimal(animalToDelete.id);
        toast.success("Animal supprimé avec succès.");
      } catch (error) {
        Sentry.captureException(error, {
          extra: { animalId: animalToDelete.id }
        });
        toast.error("Une erreur est survenue lors de la suppression de l'animal.");
      }
      setAnimalToDelete(null);
    }
  };

  return (
    <AnimalDeleteContext.Provider value={{ openDelete }}>
      {children}
      <ConfirmDialog
        open={!!animalToDelete}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet animal ?"
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
      />
    </AnimalDeleteContext.Provider>
  );
}

export function useAnimalDelete() {
  const ctx = useContext(AnimalDeleteContext);
  if (!ctx) throw new Error("useAnimalDelete must be used within AnimalDeleteProvider");
  return ctx;
}