import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { eventHighlightListSchema, eventListSchema } from '../schemas/event';
import type {
  CreateEventInput, PatchEventInput, RecurrenceScope, UpdateEventInput,
} from '../types/event';

export async function getEvents() {
  return eventListSchema.parse((await webApiClient.get('/events')).data);
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
  const response = await webApiClient.get<{ url: string }>(
    `/events/${eventId}/documents/${encodeURIComponent(filename)}`,
  );
  return validatePresignedUrl(response.data.url);
}

export async function deleteEventDocument(eventId: number, filename: string) {
  await webApiClient.delete(`/events/${eventId}/documents/${encodeURIComponent(filename)}`);
}

export async function attachEventDocument(eventId: number, filename: string) {
  await webApiClient.post(`/events/${eventId}/documents/${encodeURIComponent(filename)}`);
}
