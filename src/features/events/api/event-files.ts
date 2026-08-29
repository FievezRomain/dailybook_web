import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { eventFileNameSchema } from '../schemas/event';
import { storedFilenameSchema } from '@/shared/schemas/file';

type UploadTicket = { url: string; fields: Record<string, string>; filename: string };
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_EVENT_FILE_BYTES = 3 * 1024 * 1024;

export async function uploadEventFile(file: File, eventId?: number) {
  if (!ALLOWED_TYPES.has(file.type) || file.size < 1 || file.size > MAX_EVENT_FILE_BYTES) {
    throw new Error('Le document doit être un PDF, JPEG ou PNG de 3 Mo maximum.');
  }
  const response = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    resourceType: 'event',
    resourceId: eventId,
  });
  const ticket = response.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', file);
  const upload = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!upload.ok) throw new Error('Le transfert du document a échoué.');
  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename,
    contentType: file.type,
    resourceType: 'event',
    resourceId: eventId,
  });
  return eventFileNameSchema.parse(ticket.filename);
}

export async function deleteOrphanEventFile(filename: string, eventId?: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  const query = new URLSearchParams({ resourceType: 'event' });
  if (eventId) query.set('resourceId', String(eventId));
  await webApiClient.delete(`/files/${encodeURIComponent(safeFilename)}?${query}`);
}
