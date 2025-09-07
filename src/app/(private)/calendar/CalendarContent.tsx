'use client';

import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEvents } from "@/context/EventContext";
import { EventList } from "@/components/events/EventList";
import { Input } from "@/components/ui/input";
import frLocale from "@fullcalendar/core/locales/fr";
import "@/styles/pages/calendar.css";
import { mapEvents } from "@/utils/eventsUtils";

export default function CalendarContent() {
  const { events, isLoading: isLoadingEvents } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<string>("");

  // Format events for FullCalendar
  const calendarEvents = useMemo(() =>
    mapEvents(events || []).map(e => ({
      title: e.nom,
      date: e.dateevent,
      id: String(e.id),
      color: `rgb(var(${e.color}))`,
      extendedProps: { ...e }
    })) ?? [],
    [events]
  );

  // Filtrage des événements selon la date sélectionnée et le filtre texte
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const eventDate = new Date(event.dateevent);
      eventDate.setHours(0, 0, 0, 0);
      const isSameDay = selectedDate
        ? eventDate.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0)
        : true;
      const matchesFilter = filter
        ? event.nom?.toLowerCase().includes(filter.toLowerCase()) ||
          event.eventtype?.toLowerCase().includes(filter.toLowerCase())
        : true;
      return isSameDay && matchesFilter;
    });
  }, [events, selectedDate, filter]);

  return (
    <div className="flex flex-col md:flex-row gap-8 p-7 h-[calc(100vh-80px)]">
      {/* Calendrier à gauche */}
      <div className="md:w-2/3 w-full flex flex-col h-full">
        <div className="flex-1 w-full h-full bg-card rounded-2xl p-6 shadow-sm dark:shadow-lg dark:shadow-black/30">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={info => setSelectedDate(new Date(info.event.startStr))}
            selectable={true}
            height="100%"
            contentHeight="100%"
            locale={frLocale}
            eventClassNames="rounded-lg"
            viewClassNames="bg-card"
            dayCellClassNames="rounded-lg"
          />
        </div>
      </div>

      {/* Liste des événements à droite */}
      <div className="md:w-1/3 w-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {selectedDate
              ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : "Sélectionnez une date"}
          </h2>
        </div>
        <Input
          type="text"
          placeholder="Filtrer par nom ou type..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="mb-4"
        />
        <div className="overflow-y-auto max-h-[60vh] px-2 py-2">
          {isLoadingEvents ? (
            <p className="text-muted-foreground">Chargement des événements...</p>
          ) : (
            <EventList events={filteredEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
