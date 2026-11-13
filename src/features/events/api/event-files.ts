import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { eventFileNameSchema } from '../schemas/event';
import { storedFilenameSchema } from '@/shared/schemas/file';
import { isSupportedImageUpload, prepareImageUpload } from '@/shared/utils/prepare-image-upload';

type UploadTicket = { url: string; fields: Record<string, string>; filename: string };
const MAX_EVENT_DOCUMENT_BYTES = 3 * 1024 * 1024;
const MAX_EVENT_IMAGE_BYTES = 20 * 1024 * 1024;

export async function uploadEventFile(file: File, eventId?: number) {
  const maxSize = file.type === 'application/pdf' ? MAX_EVENT_DOCUMENT_BYTES : MAX_EVENT_IMAGE_BYTES;
  const supported = file.type === 'application/pdf' || isSupportedImageUpload(file);
  if (!supported || file.size < 1 || file.size > maxSize) {
    throw new Error('Le document doit être un PDF de 3 Mo maximum ou une image compatible de 20 Mo maximum.');
  }
  const preparedFile = file.type === 'application/pdf' ? file : await prepareImageUpload(file, 'event');
  const response = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: preparedFile.name,
    contentType: preparedFile.type,
    sizeBytes: preparedFile.size,
    resourceType: 'event',
    resourceId: eventId,
  });
  const ticket = response.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', preparedFile);
  const upload = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!upload.ok) throw new Error('Le transfert du document a échoué.');
  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename,
    contentType: preparedFile.type,
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
