"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";

import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { useEventDrawer } from "@/features/events/context/event-drawer-context";
import {
  useEventHighlights,
  useEventsQuery,
} from "@/features/events/hooks/use-events";
import type { Event } from "@/features/events/types/event";
import {
  eventToneClasses,
  eventTypeOptions,
  mapEventData,
  titleMap,
} from "@/features/events/utils/events";
import { Button, IconButton } from "@/shared/components/ui/button";
import { PageShell } from "@/shared/components/layout/PageShell";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { SearchField } from "@/shared/components/ui/search-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SystemState } from "@/shared/components/ui/system-state";
import { Icon } from "@/shared/components/ui/icons";
import { EventList } from "./EventList";

function dayKey(value: Date | string) {
  return typeof value === "string"
    ? value.slice(0, 10)
    : format(value, "yyyy-MM-dd");
}

function capitalizeFirst(value: string) {
  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1);
}
function calendarDays(month: Date) {
  const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
  return days;
}

function EventPill({ event, onClick }: { event: Event; onClick: () => void }) {
  const label = titleMap[event.eventtype] ?? "Autre";
  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick();
      }}
      title={`${label} · ${event.nom}`}
      className={`event-calendar-pill block w-full truncate rounded-sm px-1 py-0.5 text-left text-[10px] font-semibold leading-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${eventToneClasses[event.eventtype] ?? eventToneClasses.autre}`}
    >
      <span className="sr-only">{label} : </span>
      {event.nom}
    </button>
  );
}
function AgendaFilters({
  activeFilterCount,
  animals,
  animalsError,
  animalsLoading,
  eventCount,
  onClearAnimals,
  onReset,
  onSearchChange,
  onTypeChange,
  onToggleAnimal,
  search,
  selectedAnimalIds,
  type,
}: {
  activeFilterCount: number;
  animals?: Array<{ id: number; nom?: string | null }>;
  animalsError: boolean;
  animalsLoading: boolean;
  eventCount: number;
  onClearAnimals: () => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onToggleAnimal: (animalId: number) => void;
  search: string;
  selectedAnimalIds: number[];
  type: string;
}) {
  return (
    <div className="flex items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="outline" className={activeFilterCount ? "rounded-r-none" : undefined}>
          <Icon name="filter" className="size-4" />
          Filtres{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[min(42rem,calc(100dvh-2rem))] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrer l’agenda</DialogTitle>
          <DialogDescription>
            Combinez recherche, type d’événement et animaux.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <SearchField
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onClear={() => onSearchChange("")}
            className="h-10"
            placeholder="Rechercher un événement"
            label="Rechercher un événement"
          />
          <label className="grid gap-2 text-sm font-medium">
            Type d’événement
            <Select value={type} onValueChange={onTypeChange}>
              <SelectTrigger aria-label="Type d’événement" className="w-full">
                <Icon name="filter" className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {eventTypeOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          {!animalsLoading && !animalsError && Boolean(animals?.length) && (
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Animaux</legend>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={selectedAnimalIds.length === 0}
                  onClick={onClearAnimals}
                  className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${selectedAnimalIds.length === 0 ? "border-primary bg-accent text-primary" : "bg-background hover:bg-muted"}`}
                >
                  Tous les animaux
                </button>
                {animals?.map((animal) => {
                  const selected = selectedAnimalIds.includes(animal.id);
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onToggleAnimal(animal.id)}
                      className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${selected ? "border-primary bg-accent text-primary" : "bg-background hover:bg-muted"}`}
                    >
                      {animal.nom || "Animal"}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          {animalsError && (
            <p role="status" className="text-xs text-muted-foreground">
              Les filtres animaux sont temporairement indisponibles.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={activeFilterCount === 0}
            onClick={onReset}
          >
            Réinitialiser
          </Button>
          <DialogClose asChild>
            <Button type="button">
              Afficher {eventCount} événement{eventCount === 1 ? "" : "s"}
            </Button>
          </DialogClose>
        </DialogFooter>
        </DialogContent>
      </Dialog>
      {activeFilterCount > 0 && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Réinitialiser les filtres"
          title="Réinitialiser les filtres"
          className="-ml-px rounded-l-none px-2.5 text-primary hover:text-primary"
          onClick={onReset}
        >
          <Icon name="close" className="size-4" />
        </Button>
      )}
    </div>
  );
}

export default function CalendarContent() {
  const { events, isLoading, isError, isRefetchError, error, refetch } =
    useEventsQuery();
  const animalsQuery = useAnimalsQuery();
  const { openDrawer: openEventDrawer } = useEventDrawer();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<number[]>([]);
  const highlights = useEventHighlights(month.getFullYear());
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr-FR");
    return (events ?? []).filter(
      (event) =>
        (type === "all" || event.eventtype === type) &&
        (!selectedAnimalIds.length ||
          selectedAnimalIds.some((animalId) =>
            event.animaux.includes(animalId),
          )) &&
        (!query ||
          event.nom.toLocaleLowerCase("fr-FR").includes(query) ||
          (titleMap[event.eventtype] ?? "")
            .toLocaleLowerCase("fr-FR")
            .includes(query)),
    );
  }, [events, search, selectedAnimalIds, type]);
  const days = calendarDays(month);
  const eventsByDay = useMemo(() => {
    const mapped = new Map<string, Event[]>(
      days.map((day) => [dayKey(day), []]),
    );
    for (const event of filteredEvents)
      mapped.get(dayKey(event.dateevent))?.push(event);
    return mapped;
  }, [days, filteredEvents]);
  const selectedEvents = filteredEvents.filter(
    (event) => dayKey(event.dateevent) === dayKey(selectedDate),
  );
  const selectedHighlights = (highlights.data ?? []).filter(
    (highlight) => dayKey(highlight.date) === dayKey(selectedDate),
  );
  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(type !== "all") +
    selectedAnimalIds.length;
  const hasActiveFilters = activeFilterCount > 0;
  const panelEvents = hasActiveFilters ? filteredEvents : selectedEvents;
  const panelHighlights = hasActiveFilters ? [] : selectedHighlights;
  const openDetail = (event: Event) => openEventDrawer(mapEventData(event));
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    if (!isSameMonth(date, month)) setMonth(startOfMonth(date));
  };
  const toggleAnimal = (animalId: number) =>
    setSelectedAnimalIds((ids) =>
      ids.includes(animalId)
        ? ids.filter((id) => id !== animalId)
        : [...ids, animalId],
    );
  const resetFilters = () => {
    setSearch("");
    setType("all");
    setSelectedAnimalIds([]);
  };
  if (isError && !events?.length)
    return (
      <PageShell>
        <SystemState
          density="page"
          state="error"
          title="Impossible de charger l’agenda"
          description={
            error instanceof Error
              ? error.message
              : "Les événements ne sont pas disponibles pour le moment."
          }
          primaryAction={{ label: "Réessayer", onClick: () => void refetch() }}
        />
      </PageShell>
    );
  return (
    <PageShell aria-label="Agenda" className="space-y-0">
      <div className="grid items-stretch gap-section xl:grid-cols-[minmax(0,1fr)_344px]">
        <div className="flex min-w-0 flex-col gap-3">
          {isRefetchError && (
            <div
              role="status"
              className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-warning/40 bg-warning/10 px-3 py-2 text-xs"
            >
              <span>Les données affichées peuvent ne pas être à jour.</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
              >
                Réessayer
              </Button>
            </div>
          )}
          <div
            data-calendar-panel
            className="flex-1 rounded-surface border bg-card p-3 shadow-surface sm:p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">
                {capitalizeFirst(format(month, "MMMM yyyy", { locale: fr }))}
              </h2>
              <div className="flex items-center gap-1">
                <AgendaFilters
                  activeFilterCount={activeFilterCount}
                  animals={animalsQuery.animals}
                  animalsError={animalsQuery.isError}
                  animalsLoading={animalsQuery.isLoading}
                  eventCount={filteredEvents.length}
                  onClearAnimals={() => setSelectedAnimalIds([])}
                  onReset={resetFilters}
                  onSearchChange={setSearch}
                  onTypeChange={setType}
                  onToggleAnimal={toggleAnimal}
                  search={search}
                  selectedAnimalIds={selectedAnimalIds}
                  type={type}
                />
                <IconButton
                  label="Mois précédent"
                  size="compact"
                  onClick={() => setMonth((value) => subMonths(value, 1))}
                >
                  <Icon name="previous" className="size-5" />
                </IconButton>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const today = new Date();
                    setMonth(startOfMonth(today));
                    setSelectedDate(today);
                  }}
                >
                  Aujourd’hui
                </Button>
                <IconButton
                  label="Mois suivant"
                  size="compact"
                  onClick={() => setMonth((value) => addMonths(value, 1))}
                >
                  <Icon name="next" className="size-5" />
                </IconButton>
              </div>
            </div>
            <div
              className="grid grid-cols-7 gap-1"
              role="grid"
              aria-label={`Calendrier ${format(month, "MMMM yyyy", { locale: fr })}`}
            >
              {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className="px-1 pb-1 text-center text-[10px] font-medium text-muted-foreground"
                  aria-hidden="true"
                >
                  {label}
                </div>
              ))}
              {isLoading
                ? Array.from({ length: 35 }, (_, index) => (
                    <div
                      key={index}
                      className="h-[72px] animate-pulse rounded-control bg-muted sm:h-[clamp(96px,13dvh,136px)] motion-reduce:animate-none"
                    />
                  ))
                : days.map((day) => {
                    const dayEvents = eventsByDay.get(dayKey(day)) ?? [];
                    const selected = isSameDay(day, selectedDate);
                    const label = `${format(day, "EEEE d MMMM", { locale: fr })}, ${dayEvents.length} événement${dayEvents.length > 1 ? "s" : ""}`;
                    return (
                      <div
                        key={day.toISOString()}
                        role="gridcell"
                        aria-label={label}
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={(clickEvent) => {
                          if (
                            !(clickEvent.target as HTMLElement).closest(
                              "button",
                            )
                          ) {
                            selectDate(day);
                            clickEvent.currentTarget.focus();
                          }
                        }}
                        onKeyDown={(keyEvent) => {
                          if (
                            (keyEvent.key === "Enter" ||
                              keyEvent.key === " ") &&
                            keyEvent.target === keyEvent.currentTarget
                          ) {
                            keyEvent.preventDefault();
                            selectDate(day);
                          }
                        }}
                        className={`min-h-[72px] rounded-control border p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[clamp(96px,13dvh,136px)] ${isSameMonth(day, month) ? "cursor-pointer bg-muted/60 hover:bg-accent" : "cursor-pointer bg-background text-muted-foreground"} ${selected ? "border-ring bg-accent" : "border-border"}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`block rounded-sm px-1 text-left text-[10px] font-medium ${isSameDay(day, new Date()) ? "text-primary" : ""}`}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <EventPill
                              key={event.id}
                              event={event}
                              onClick={() => openDetail(event)}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="block px-1 text-[10px] font-semibold text-muted-foreground">
                              +{dayEvents.length - 2} autres
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
        <aside
          data-day-panel
          className="min-h-[clamp(28rem,65dvh,44rem)] rounded-surface border bg-card p-4 shadow-surface xl:sticky xl:top-4"
        >
          <div className="mb-3">
            <h2 className="text-[15px] font-semibold">
              {hasActiveFilters
                ? "Recherche"
                : capitalizeFirst(format(selectedDate, "EEEE d MMMM", { locale: fr }))}
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {panelEvents.length + panelHighlights.length} élément
              {panelEvents.length + panelHighlights.length > 1 ? "s" : ""}
            </p>
          </div>
          {panelEvents.length || panelHighlights.length ? (
            <div className="space-y-2">
              {panelEvents.length > 0 && (
                <EventList events={panelEvents} />
              )}
              {panelHighlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="rounded-control border border-dashed p-3 text-xs"
                >
                  <span className="font-semibold">{highlight.title}</span>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    Rappel annuel
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center text-center">
              <div>
                <Icon name="agenda" className="mx-auto mb-3 size-7 text-muted-foreground" />
                <p className="text-sm font-semibold">
                  {hasActiveFilters
                    ? "Aucun événement trouvé"
                    : "Aucun événement ce jour"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasActiveFilters
                    ? "Modifiez ou réinitialisez les filtres pour élargir la recherche."
                    : "Utilisez Créer ou choisissez une autre date."}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
