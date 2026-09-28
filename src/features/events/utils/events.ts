import type { Event, MappedEvent } from '@/features/events/types/event';
import { differenceInCalendarDays, isAfter, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import type { IconName } from '@/shared/components/ui/icons';

const eventDate = (event: Event) => startOfDay(parseISO(event.dateevent));
export const hasCompletedState = (event: Event) =>
  ['completed', 'done', 'termine', 'true'].includes(
    event.state
      .trim()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('fr-FR'),
  );

export const filterToday = (events: Event[], referenceDate = new Date()) =>
  events.filter((event) => isSameDay(eventDate(event), referenceDate));

export const filterUpcoming = (events: Event[], referenceDate = new Date()) => {
  const today = startOfDay(referenceDate);
  return events.filter((event) => isAfter(eventDate(event), today));
};

export const filterLate = (events: Event[], referenceDate = new Date()) => {
  const today = startOfDay(referenceDate);
  return events
    .filter((event) => isBefore(eventDate(event), today) && !hasCompletedState(event))
    .sort((left, right) => eventDate(left).getTime() - eventDate(right).getTime());
};

function parseDateParts(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return year && month && day ? Date.UTC(year, month - 1, day) : undefined;
}

function parseTimeParts(value?: string) {
  if (!value) return undefined;
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return undefined;
  return hours * 60 + minutes;
}

export function formatWalkDuration(event: Pick<Event, 'dateevent' | 'heuredebutevent' | 'heuredebutbalade' | 'datefinbalade' | 'heurefinbalade'>) {
  const startTime = parseTimeParts(event.heuredebutbalade || event.heuredebutevent);
  const endTime = parseTimeParts(event.heurefinbalade);
  const startDate = parseDateParts(event.dateevent);
  const endDate = parseDateParts(event.datefinbalade || event.dateevent);
  if (startTime === undefined || endTime === undefined || startDate === undefined || endDate === undefined) return undefined;

  const durationMinutes = Math.round((endDate - startDate) / 86_400_000) * 1_440 + endTime - startTime;
  if (durationMinutes <= 0) return undefined;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return [hours ? `${hours} h` : '', minutes ? `${minutes} min` : ''].filter(Boolean).join(' ');
}

export const eventTypeOptions = [
  { value: 'soins', label: 'Soins', icon: 'medical' },
  { value: 'rdv', label: 'Rendez-vous médical', icon: 'stethoscope' },
  { value: 'balade', label: 'Balade', icon: 'compass' },
  { value: 'entrainement', label: 'Entraînement', icon: 'tracking' },
  { value: 'concours', label: 'Concours', icon: 'trophy' },
  { value: 'depense', label: 'Dépense', icon: 'expense' },
  { value: 'autre', label: 'Autre', icon: 'circleCheck' },
] as const;

export const iconsMap: Record<string, IconName> =
  Object.fromEntries(eventTypeOptions.map(({ value, icon }) => [value, icon]));

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

export const titleMap: Record<string, string> = Object.fromEntries(
  eventTypeOptions.map(({ value, label }) => [value, label]),
);

export const mapEventData = (event: Event): MappedEvent => {

  let delay;
  const datedEvent = eventDate(event);
  if (isBefore(datedEvent, startOfDay(new Date())) && !hasCompletedState(event)) {
    delay = differenceInCalendarDays(startOfDay(new Date()), datedEvent);
  }

  return {
    ...event,
    color: colorsMap[event.eventtype] || "var(--event-autre)",
    icon: iconsMap[event.eventtype] || 'circleCheck',
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
