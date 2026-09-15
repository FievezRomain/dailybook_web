"use client";

import { useMemo } from "react";
import { CalendarCheck2 } from "lucide-react";
import { EventList } from "@/features/events/components/EventList";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { filterToday } from "@/features/events/utils/events";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function TodayTasksCard() {
  const { events, isLoading, isError, error, refetch } = useEventsQuery();
  const filteredEvents = useMemo(() => filterToday(events ?? []), [events]);

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/70 py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/60 bg-muted/25 px-4 py-3 pr-14">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarCheck2 className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <CardTitle role="heading" aria-level={2}>Aujourd’hui</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""}</p>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {isLoading && <div className="space-y-3" aria-label="Chargement des événements du jour"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>}
        {isError && <div role="alert" className="space-y-3"><p className="font-medium">Les événements du jour sont indisponibles.</p><p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Le chargement a échoué."}</p><Button variant="outline" onClick={() => void refetch()}>Réessayer</Button></div>}
        {!isLoading && !isError && filteredEvents.length === 0 && (
          <div className="grid min-h-28 place-items-center rounded-xl border border-dashed bg-muted/20 p-4 text-center"><div><CalendarCheck2 className="mx-auto mb-2 size-6 text-primary/60" /><p className="text-sm font-medium">Journée libre</p><p className="mt-1 text-xs text-muted-foreground">Rien de prévu aujourd’hui.</p></div></div>
        )}
        {!isLoading && !isError && filteredEvents.length > 0 && <EventList events={filteredEvents} />}
      </CardContent>
    </Card>
  );
}
