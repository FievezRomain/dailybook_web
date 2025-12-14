import { filterAnimals } from "@/utils/animalsUtils";
import { Skeleton } from "../ui/skeleton";
import { Animal } from "@/types/animal";
import { Objective } from "@/types/objective";
import { ObjectiveCard } from "./ObjectiveCard";

type ObjectiveCardWrapperProps = {
  objective: Objective;
  animals: Animal[] | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: (objectiveId: number, etapeId: number, objective: Objective) => void;
  onUpdateAnimalImage: (id: number, imageObj: any) => void;
};

export function ObjectiveCardWrapper({ objective, animals, onEdit, onDelete, onComplete, onUpdateAnimalImage }: ObjectiveCardWrapperProps) {
  const enrichedAnimals = animals ? filterAnimals(objective, animals) : undefined;

  if (!enrichedAnimals) {
    return (
      <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  return (
    <ObjectiveCard
      onEdit={onEdit}
      onDelete={onDelete}
      onComplete={onComplete}
      onUpdateAnimalImage={onUpdateAnimalImage}
      objective={objective}
      animals={enrichedAnimals}
    />
  );
}