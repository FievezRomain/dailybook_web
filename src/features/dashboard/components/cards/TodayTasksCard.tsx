"use client";

import { useMemo } from "react";
import { format } from 'date-fns';
import { CalendarCheck2, TriangleAlert } from "lucide-react";
import { EventList } from "@/features/events/components/EventList";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { filterLate, filterToday, hasCompletedState } from "@/features/events/utils/events";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function TodayTasksCard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { events, isLoading, isError, error, refetch } = useEventsQuery({
    dateFrom: today,
    dateTo: today,
    includeOverdueOpen: true,
  });
  const todayEvents = useMemo(() => filterToday(events ?? []), [events]);
  const lateEvents = useMemo(() => filterLate(events ?? []), [events]);
  const hasEvents = todayEvents.length > 0 || lateEvents.length > 0;
  const taskCount = todayEvents.length + lateEvents.length;
  const completedTaskCount = todayEvents.filter(hasCompletedState).length;
  const completionPercentage = taskCount > 0
    ? Math.round((completedTaskCount / taskCount) * 100)
    : 0;

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden border-border/70 p-0 shadow-sm">
      <CardHeader className="space-y-3 border-b border-border/60 bg-muted/25 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-3 pr-10">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarCheck2 className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <CardTitle role="heading" aria-level={2}>Aujourd’hui</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {todayEvents.length} aujourd’hui{lateEvents.length ? ` · ${lateEvents.length} en retard` : ""}
            </p>
          </div>
        </div>
        {!isLoading && !isError && hasEvents && (
          <section aria-label="Progression des tâches du jour">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-foreground">Progression du jour</span>
              <span className="font-bold tabular-nums text-primary">{completionPercentage} %</span>
            </div>
            <div
              role="progressbar"
              aria-label="Tâches réalisées aujourd’hui"
              aria-valuemin={0}
              aria-valuemax={taskCount}
              aria-valuenow={completedTaskCount}
              aria-valuetext={`${completedTaskCount} sur ${taskCount}`}
              className="h-2 overflow-hidden rounded-full bg-primary/15"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completedTaskCount} tâche{completedTaskCount !== 1 ? "s" : ""} sur {taskCount} réalisée{completedTaskCount !== 1 ? "s" : ""}
            </p>
          </section>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {isLoading && <div className="space-y-3" aria-label="Chargement des événements du jour"><Skeleton className="h-24 w-full rounded-xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>}
        {isError && <div role="alert" className="space-y-3"><p className="font-medium">Les événements du jour sont indisponibles.</p><p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : "Le chargement a échoué."}</p><Button variant="outline" onClick={() => void refetch()}>Réessayer</Button></div>}
        {!isLoading && !isError && !hasEvents && (
          <div className="grid min-h-28 place-items-center rounded-xl border border-dashed bg-muted/20 p-4 text-center"><div><CalendarCheck2 className="mx-auto mb-2 size-6 text-primary/60" /><p className="text-sm font-medium">Journée libre</p><p className="mt-1 text-xs text-muted-foreground">Rien de prévu aujourd’hui.</p></div></div>
        )}
        {!isLoading && !isError && lateEvents.length > 0 && (
          <section aria-labelledby="late-events-title" className="mb-4 space-y-2.5">
            <div className="flex items-center justify-between gap-3 px-1">
              <h3 id="late-events-title" className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <TriangleAlert aria-hidden="true" className="size-4" />
                En retard
              </h3>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">{lateEvents.length}</span>
            </div>
            <EventList events={lateEvents} strikeCompleted />
          </section>
        )}
        {!isLoading && !isError && todayEvents.length > 0 && (
          <section aria-label="Événements d’aujourd’hui" className={lateEvents.length ? "space-y-2.5 border-t border-border/60 pt-3" : undefined}>
            {lateEvents.length ? <h3 className="px-1 text-sm font-semibold">Aujourd’hui</h3> : null}
            <EventList events={todayEvents} strikeCompleted />
          </section>
        )}
      </CardContent>
    </Card>
  );
}
