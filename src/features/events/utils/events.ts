import type { Event, MappedEvent } from '@/features/events/types/event';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';
import { Banknote, CircleCheck, Compass, HandHeart, Stethoscope, TrafficCone, Trophy } from 'lucide-react';

export const filterToday = (events: Event[]) => {
  const today = new Date().toDateString();
  return events.filter(e => new Date(e.dateevent).toDateString() === today);
};

export const filterUpcoming = (events: Event[]) => {
  const now = new Date();
  return events.filter(e => new Date(e.dateevent) > now);
};

export const filterLate = (events: Event[]) => {
  const today = startOfDay(new Date());
  return events.filter(e => new Date(e.dateevent) < today && e.state === "À faire");
};

export const iconsMap: Record<string, React.ComponentType<{ className?: string }>> = {
  depense: Banknote,
  balade: Compass,
  soins: HandHeart,
  concours: Trophy,
  entrainement: TrafficCone,
  autre: CircleCheck,
  rdv: Stethoscope,
};

export const colorsMap: Record<string, string> = {
    depense: "var(--event-depense)",
    balade: "var(--event-balade)",
    soins: "var(--event-soins)",
    concours: "var(--event-concours)",
    entrainement: "var(--event-entrainement)",
    autre: "var(--event-autre)",
    rdv: "var(--event-rdv)",
};

export const eventToneClasses: Record<string, string> = {
  depense: "event-tone-depense",
  balade: "event-tone-balade",
  soins: "event-tone-soins",
  concours: "event-tone-concours",
  entrainement: "event-tone-entrainement",
  autre: "event-tone-autre",
  rdv: "event-tone-rdv",
};

export const titleMap: Record<string, string> = {
    depense: "Dépense",
    balade: "Balade",
    soins: "Soins",
    concours: "Concours",
    entrainement: "Entraînement",
    autre: "Autre",
    rdv: "Rendez-vous",
};

export const mapEventData = (event: Event): MappedEvent => {

  let delay;
  const eventDate = startOfDay(new Date(event.dateevent));
  if (isBefore(eventDate, startOfDay(new Date())) && event.state === "À faire") {
    delay = differenceInDays(startOfDay(new Date()), eventDate);
  }

  return {
    ...event,
    color: colorsMap[event.eventtype] || "var(--event-autre)",
    icon: iconsMap[event.eventtype] || CircleCheck,
    delay,
    titleType: titleMap[event.eventtype] || "Autre",
  };
};

export const mapEvents = (events: Event[]) => events.map(mapEventData);

export function isEventComplete(event: Partial<Event>): event is Event {
  return (
    typeof event.id === "number" &&
    typeof event.nom === "string" &&
    typeof event.dateevent === "string" &&
    typeof event.eventtype === "string" &&
    Array.isArray(event.animaux) &&
    typeof event.state === "string"
  );
}
