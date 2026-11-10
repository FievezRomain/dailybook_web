import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { animalFilenameSchema } from '../schemas/animal';
import { storedFilenameSchema } from '@/shared/schemas/file';
import { isSupportedImageUpload, prepareImageUpload } from '@/shared/utils/prepare-image-upload';

type AnimalFileResource = 'animal' | 'body';
type UploadTicket = { url: string; fields: Record<string, string>; filename: string };

const MAX_BYTES: Record<AnimalFileResource, number> = { animal: 20 * 1024 * 1024, body: 20 * 1024 * 1024 };

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
  if (!isSupportedImageUpload(file) || file.size < 1 || file.size > MAX_BYTES[resourceType]) {
    const max = resourceType === 'body' ? '1 Mo' : '500 Ko';
    throw new Error(`La photo source doit être compatible et ne pas dépasser 20 Mo ; elle sera compressée à ${max}.`);
  }
  const preparedFile = await prepareImageUpload(file, resourceType);
  const response = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: preparedFile.name, contentType: preparedFile.type, sizeBytes: preparedFile.size, resourceType, resourceId,
  });
  const ticket = response.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', preparedFile);
  const upload = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!upload.ok) throw new Error('Le transfert de la photo a échoué.');
  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename, contentType: preparedFile.type, resourceType, resourceId,
  });
  return animalFilenameSchema.parse(ticket.filename);
}

export async function deleteAnimalFile(filename: string, resourceType: AnimalFileResource, resourceId: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  await webApiClient.delete(`/files/${encodeURIComponent(safeFilename)}?${query(resourceType, resourceId)}`);
}
