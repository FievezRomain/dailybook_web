import { filterAnimals } from "@/features/animals/utils/animals";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EventCard } from "./EventCard";
import type { Event, MappedEvent } from "@/features/events/types/event";
import type { ImageSigned } from "@/types/image";
import type { Animal } from "@/features/animals/types/animal";

type EventCardWrapperProps = {
  event: MappedEvent;
  animals: Animal[] | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: (id: number, event: Event) => void;
  onOpenDrawer: () => void;
  onDuplicate: () => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void;
};

export function EventCardWrapper({ event, animals, onEdit, onDelete, onComplete, onOpenDrawer, onDuplicate, onUpdateAnimalImage }: EventCardWrapperProps) {
  const enrichedAnimals = animals ? filterAnimals(event, animals) : undefined;

  if (!enrichedAnimals) {
    return (
      <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  return (
    <EventCard
      onEdit={onEdit}
      onDelete={onDelete}
      onComplete={onComplete}
      onOpenDrawer={onOpenDrawer}
      onDuplicate={onDuplicate}
      onUpdateAnimalImage={onUpdateAnimalImage}
      event={event}
      animals={enrichedAnimals}
    />
  );
}
