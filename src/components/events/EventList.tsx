import { Event } from "@/types/event";
import { EventCard } from "./EventCard";
import { mapEvents } from "@/utils/eventsUtils";
import useSWR from "swr";
import { getAnimals } from "@/api/animals";
import { getFileUrl } from "@/utils/s3Utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "../ui/skeleton";

export const EventList = ({ events }: { events: Event[] }) => {
  if (events.length === 0) {
    return <p className="text-muted-foreground">Aucun événement</p>;
  }

  const { user, isLoading: isLoadingUser, isError } = useCurrentUser(); 
  const { data: animals, isLoading: isLoadingAnimals } = useSWR(['animals'], () => getAnimals());

  const enrichedEvents = mapEvents(events);

  if (isLoadingUser) {
    return (
      <div className="space-y-4">
        {events.map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {enrichedEvents.map((event) => {
        const linkedAnimals = Array.isArray(animals)
            ? animals.filter((a) => event.animaux.includes(a.id))
            : [];

        const enrichedAnimals = linkedAnimals.map((animal) => ({
            ...animal,
            image: animal.image
                ? getFileUrl(animal.image, user.uid)
                : undefined,
            }));

        return (
            <div key={event.id} className="py-2">
                <EventCard event={event} animals={isLoadingAnimals ? undefined : enrichedAnimals} onComplete={()=> console.log("tâche effectuée")} onDelete={()=> console.log("delete")} onEdit={()=>console.log("edit")} />
            </div>
        )}
      )}
    </div>
  );
};
