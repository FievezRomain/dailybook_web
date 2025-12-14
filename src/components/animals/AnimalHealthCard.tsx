import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { EventList } from "@/components/events/EventList";
import { Event } from "@/types/event";

interface AnimalHealthCardProps {
  isLoading: boolean;
  events: Event[];
}

const FILTERS = [
  { label: "Tous", value: "all" },
  { label: "Soins", value: "soins" },
  { label: "Rendez-vous", value: "rdv" },
];

export function AnimalHealthCard({ isLoading, events }: AnimalHealthCardProps) {
  const [filter, setFilter] = useState<"all" | "soins" | "rdv">("all");

  const filteredEvents = events.filter(e =>
    filter === "all" ? true : e.eventtype === filter
  );

  return (
    <div className="bg-card rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/30 p-6 h-full overflow-hidden flex flex-col max-h-[140dvh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Carnet de santé</h2>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`px-3 py-1 rounded text-sm transition cursor-pointer ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={() => setFilter(f.value as "all" | "soins" | "rdv")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full px-2">
            <EventList events={filteredEvents} />
          </div>
        </div>
      )}
    </div>
  );
}