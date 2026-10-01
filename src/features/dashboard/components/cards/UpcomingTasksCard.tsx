"use client";

import { useMemo } from "react";
import { addDays, format } from 'date-fns';
import { CalendarRange } from "lucide-react";
import { EventList } from "@/features/events/components/EventList";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { filterUpcoming } from "@/features/events/utils/events";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function UpcomingTasksCard() {
  const { events, isLoading, isError, error, refetch } = useEventsQuery({
    dateFrom: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    limit: 100,
  });
  const filteredEvents = useMemo(() => filterUpcoming(events ?? []), [events]);

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/70 p-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/60 bg-muted/25 px-4 py-3 pr-14">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarRange className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1"><CardTitle role="heading" aria-level={2}>Prochains jours</CardTitle><p className="mt-0.5 text-xs text-muted-foreground">{filteredEvents.length} à venir</p></div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {isLoading && <div className="space-y-3" aria-label="Chargement des prochains événements"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>}
        {isError && <div role="alert" className="space-y-3"><p className="font-medium">Les prochains événements sont indisponibles.</p><p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Le chargement a échoué."}</p><Button variant="outline" onClick={() => void refetch()}>Réessayer</Button></div>}
        {!isLoading && !isError && filteredEvents.length === 0 && <div className="grid min-h-24 place-items-center rounded-xl border border-dashed bg-muted/20 p-4 text-center"><p className="text-sm text-muted-foreground">Aucun événement prévu dans les prochains jours.</p></div>}
        {!isLoading && !isError && filteredEvents.length > 0 && <EventList events={filteredEvents} strikeCompleted />}
      </CardContent>
    </Card>
  );
}
