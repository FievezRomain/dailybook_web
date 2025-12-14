import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import * as Sentry from "@sentry/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Objective } from "@/types/objective";
import { useObjectives } from "./ObjectiveContext";

type ObjectiveDeleteContextType = {
  openDelete: (objective: Objective) => void;
};

const ObjectiveDeleteContext = createContext<ObjectiveDeleteContextType | undefined>(undefined);

export function ObjectiveDeleteProvider({ children }: { children: ReactNode }) {
  const [objectiveToDelete, setObjectiveToDelete] = useState<Objective | null>(null);
  const { deleteObjective } = useObjectives();

  const openDelete = (objective: Objective) => setObjectiveToDelete(objective);
  const closeDelete = () => setObjectiveToDelete(null);

  const handleConfirmDelete = async () => {
    if (objectiveToDelete) {
      try {
        await deleteObjective(objectiveToDelete.id);
        toast.success("Objectif supprimé avec succès.");
      } catch (error) {
        Sentry.captureException(error, {
          extra: { objectiveId: objectiveToDelete.id }
        });
        toast.error("Une erreur est survenue lors de la suppression de l'objectif.");
      }
      setObjectiveToDelete(null);
    }
  };

  return (
    <ObjectiveDeleteContext.Provider value={{ openDelete }}>
      {children}
      <ConfirmDialog
        open={!!objectiveToDelete}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet objectif ?"
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
      />
    </ObjectiveDeleteContext.Provider>
  );
}

export function useObjectiveDelete() {
  const ctx = useContext(ObjectiveDeleteContext);
  if (!ctx) throw new Error("useObjectiveDelete must be used within ObjectiveDeleteProvider");
  return ctx;
}