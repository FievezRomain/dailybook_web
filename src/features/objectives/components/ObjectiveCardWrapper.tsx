import { filterAnimals } from "@/features/animals/utils/animals";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Animal } from "@/features/animals/types/animal";
import type { Objective } from "@/features/objectives/types/objective";
import type { ImageSigned } from "@/types/image";
import { ObjectiveCard } from "./ObjectiveCard";

type ObjectiveCardWrapperProps = {
  objective: Objective;
  animals: Animal[] | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onComplete: (objectiveId: number, etapeId: number, objective: Objective) => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

export function ObjectiveCardWrapper({ objective, animals, onEdit, onDelete, onDuplicate, onComplete, onUpdateAnimalImage }: ObjectiveCardWrapperProps) {
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
      onDuplicate={onDuplicate}
      onComplete={onComplete}
      onUpdateAnimalImage={onUpdateAnimalImage}
      objective={objective}
      animals={enrichedAnimals}
    />
  );
}
