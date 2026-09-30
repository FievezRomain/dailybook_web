import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { eventHighlightListSchema, eventListSchema } from '../schemas/event';
import type {
  CreateEventInput, PatchEventInput, RecurrenceScope, UpdateEventInput,
} from '../types/event';

export type EventListQuery = {
  dateFrom?: string;
  dateTo?: string;
  animalIds?: number[];
  eventTypes?: string[];
  states?: string[];
  includeOverdueOpen?: boolean;
  limit?: number;
  offset?: number;
};

export async function getEvents(filters: EventListQuery = {}) {
  const query = new URLSearchParams();
  if (filters.dateFrom) query.set('date_from', filters.dateFrom);
  if (filters.dateTo) query.set('date_to', filters.dateTo);
  filters.animalIds?.forEach((id) => query.append('animal_ids', String(id)));
  filters.eventTypes?.forEach((type) => query.append('event_types', type));
  filters.states?.forEach((state) => query.append('states', state));
  if (filters.includeOverdueOpen) query.set('include_overdue_open', 'true');
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.offset) query.set('offset', String(filters.offset));
  const suffix = query.size ? `?${query}` : '';
  return eventListSchema.parse((await webApiClient.get(`/events${suffix}`)).data);
}

export async function getEventHighlights(year: number) {
  return eventHighlightListSchema.parse((await webApiClient.get(`/events/highlights?year=${year}`)).data);
}

export async function createEvent(input: CreateEventInput) {
  return eventListSchema.parse((await webApiClient.post('/events', input)).data);
}

export async function updateEvent(id: number, input: UpdateEventInput) {
  return eventListSchema.parse((await webApiClient.put(`/events/${id}`, input)).data);
}

export async function patchEvent(id: number, input: PatchEventInput) {
  return eventListSchema.parse((await webApiClient.patch(`/events/${id}`, input)).data);
}

export async function deleteEvent(id: number, scope: RecurrenceScope = 'occurrence') {
  return eventListSchema.parse((await webApiClient.delete(`/events/${id}?scope=${scope}`)).data);
}

export async function getEventDocumentUrl(eventId: number, filename: string) {
  const query = new URLSearchParams({ resourceType: 'event', resourceId: String(eventId) });
  const response = await webApiClient.get<{ url: string }>(
    `/files/${encodeURIComponent(filename)}?${query}`,
  );
  return validatePresignedUrl(response.data.url);
}

export async function deleteEventDocument(eventId: number, filename: string) {
  await webApiClient.delete(`/events/${eventId}/documents/${encodeURIComponent(filename)}`);
}

export async function attachEventDocument(eventId: number, filename: string) {
  await webApiClient.post(`/events/${eventId}/documents/${encodeURIComponent(filename)}`);
}
