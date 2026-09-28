import type { Event } from '@/features/events/types/event';

const MEDICAL_EVENT_TYPES = new Set(['soins', 'rdv']);

export function getAnimalMedicalEvents(events: readonly Event[], animalId: number): Event[] {
  return events
    .filter((event) =>
      !event.idparent
      && event.todisplay !== false
      && event.animaux.includes(animalId)
      && MEDICAL_EVENT_TYPES.has(event.eventtype))
    .sort((left, right) => right.dateevent.localeCompare(left.dateevent));
}

export function getAnimalMedicalDocuments(events: readonly Event[]) {
  return events.flatMap((event) => event.documents.map((document) => ({
    eventId: event.id,
    eventName: event.nom || event.eventtype,
    eventDate: event.dateevent,
    name: document.name,
  })));
}
