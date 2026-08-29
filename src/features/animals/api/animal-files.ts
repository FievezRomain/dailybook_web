import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { animalFilenameSchema } from '../schemas/animal';
import { storedFilenameSchema } from '@/shared/schemas/file';

type AnimalFileResource = 'animal' | 'body';
type UploadTicket = { url: string; fields: Record<string, string>; filename: string };

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES: Record<AnimalFileResource, number> = { animal: 500 * 1024, body: 1024 * 1024 };

function query(resourceType: AnimalFileResource, resourceId: number) {
  return new URLSearchParams({ resourceType, resourceId: String(resourceId) }).toString();
}

export async function getAnimalFileUrl(filename: string, resourceType: AnimalFileResource, resourceId: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  const response = await webApiClient.get<{ url: string }>(
    `/files/${encodeURIComponent(safeFilename)}?${query(resourceType, resourceId)}`,
  );
  return validatePresignedUrl(response.data.url);
}

export async function uploadAnimalFile(file: File, resourceType: AnimalFileResource, resourceId: number) {
  if (!ALLOWED_TYPES.has(file.type) || file.size < 1 || file.size > MAX_BYTES[resourceType]) {
    const max = resourceType === 'body' ? '1 Mo' : '500 Ko';
    throw new Error(`La photo doit être au format JPEG, PNG ou WebP et ne pas dépasser ${max}.`);
  }
  const response = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: file.name, contentType: file.type, sizeBytes: file.size, resourceType, resourceId,
  });
  const ticket = response.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', file);
  const upload = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!upload.ok) throw new Error('Le transfert de la photo a échoué.');
  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename, contentType: file.type, resourceType, resourceId,
  });
  return animalFilenameSchema.parse(ticket.filename);
}

export async function deleteAnimalFile(filename: string, resourceType: AnimalFileResource, resourceId: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  await webApiClient.delete(`/files/${encodeURIComponent(safeFilename)}?${query(resourceType, resourceId)}`);
}
