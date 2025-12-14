import { useAnimals } from "@/context/AnimalContext";
import { ObjectiveCardWrapper } from "./ObjectiveCardWrapper";
import { Objective } from "@/types/objective";
import { useObjectiveDelete } from "@/context/ObjectiveDeleteContext";
import { useObjectiveFormDrawer } from "@/context/ObjectiveFormDrawerContext";
import { useObjectives } from "@/context/ObjectiveContext";

export const ObjectiveList = ({ objectives }: { objectives: Objective[] }) => {
  const { updateSousEtapesObjectifs } = useObjectives();

  // Si la liste des objectifs est vide, affiche un message
  if (objectives.length === 0) {
    return <p className="text-muted-foreground">Aucun objectif en cours</p>;
  }

  // Récupération des animaux
  const { animals, isLoading: isLoadingAnimals, updateAnimalImage } = useAnimals();

  // Gestion de l'ouverture du dialog pour confirmer la suppression d'un objectif
  const { openDelete } = useObjectiveDelete();

  // Utilise le context pour ouvrir le formulaire
  const { openDrawer: openDrawerForm } = useObjectiveFormDrawer();

  // Ouvre le drawer pour édition via le context
  const handleEdit = (objective: Objective) => {
    openDrawerForm({ initialObjective: objective });
  };

  const handleComplete = async (objectiveId: number, etapeId: number, objective: Objective) => {
    const updatedEtapes = objective.sousetapes.map((etape) =>
      etape.id === etapeId ? { ...etape, state: etape.state === true ? false : true } : etape
    );
    await updateSousEtapesObjectifs(objectiveId, { ...objective, sousetapes: updatedEtapes });
  };

  return (
      objectives.map((objective) => (
        <div key={objective.id} className="py-2">
          <ObjectiveCardWrapper
            objective={objective}
            animals={animals}
            onComplete={handleComplete}
            onDelete={() => openDelete(objective)}
            onEdit={() => handleEdit(objective)}
            onUpdateAnimalImage={updateAnimalImage} 
          />
        </div>
        ))
      );
};

