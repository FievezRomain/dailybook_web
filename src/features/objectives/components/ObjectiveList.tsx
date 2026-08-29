"use client";

import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { ObjectiveCardWrapper } from "./ObjectiveCardWrapper";
import type { Objective } from "@/features/objectives/types/objective";
import { useObjectiveFormDrawer } from "@/features/objectives/context/objective-form-drawer-context";
import { useObjectivesQuery } from "@/features/objectives/hooks/use-objectives";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/feedback/ConfirmDialog";
import * as Sentry from "@sentry/react";

export const ObjectiveList = ({ objectives }: { objectives: Objective[] }) => {
  const { updateSubtaskState, deleteObjective } = useObjectivesQuery();

  // Récupération des animaux
  const { animals, updateAnimalImage } = useAnimalsQuery();

  const [objectiveToDelete, setObjectiveToDelete] = useState<Objective | null>(null);

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useObjectiveFormDrawer();

  if (objectives.length === 0) {
    return <p className="text-muted-foreground">Aucun objectif en cours</p>;
  }

  // Ouvre le drawer pour édition via le context
  const handleEdit = (objective: Objective) => {
    openDrawerForm({ initialObjective: objective });
  };

  const handleDuplicate = (objective: Objective) => {
    openDrawerForm({ initialObjective: objective, isDuplicate: true });
  };

  const handleComplete = async (objectiveId: number, etapeId: number, objective: Objective) => {
    const subtask = objective.sousetapes.find((item) => item.id === etapeId);
    if (!subtask) return;
    try {
      await updateSubtaskState(objectiveId, etapeId, !subtask.state);
    } catch {
      toast.error("La mise à jour de l’étape a échoué.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!objectiveToDelete) return;
    try {
      await deleteObjective(objectiveToDelete.id);
      toast.success("Objectif supprimé avec succès.");
    } catch (error) {
      Sentry.captureException(error, { extra: { objectiveId: objectiveToDelete.id } });
      toast.error("Une erreur est survenue lors de la suppression de l'objectif.");
    } finally {
      setObjectiveToDelete(null);
    }
  };

  return (
    <>
      {objectives.map((objective) => (
        <div key={objective.id} className="py-2">
          <ObjectiveCardWrapper
            objective={objective}
            animals={animals}
            onComplete={handleComplete}
            onDelete={() => setObjectiveToDelete(objective)}
            onEdit={() => handleEdit(objective)}
            onDuplicate={() => handleDuplicate(objective)}
            onUpdateAnimalImage={updateAnimalImage}
          />
        </div>
        ))}
      <ConfirmDialog
        open={objectiveToDelete !== null}
        title="Confirmer la suppression"
        description="Voulez-vous vraiment supprimer cet objectif ?"
        onCancel={() => setObjectiveToDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        confirmLabel="Supprimer"
      />
    </>
      );
};
