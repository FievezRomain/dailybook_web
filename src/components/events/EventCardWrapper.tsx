import { filterAnimals } from "@/utils/animalsUtils";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { EventCard } from "./EventCard";
import { MappedEvent } from "@/types/event";
import { Animal } from "@/types/animal";
import { User } from "@/types/user";

type EventCardWrapperProps = {
  event: MappedEvent;
  animals: Animal[] | undefined;
  [key: string]: any;
};

export function EventCardWrapper({ event, animals, onEdit, onDelete, onComplete, onOpenDrawer, onDuplicate, ...props }: EventCardWrapperProps) {
  const [enrichedAnimals, setEnrichedAnimals] = useState<Animal[] | undefined>(undefined);

  useEffect(() => {
    if (animals) {
      setEnrichedAnimals(filterAnimals(event, animals));
    } else {
      setEnrichedAnimals(undefined);
    }
  }, [event, animals]);

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
      event={event}
      animals={enrichedAnimals}
      {...props}
    />
  );
}