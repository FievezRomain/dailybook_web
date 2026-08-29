import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { wishFilenameSchema } from '../schemas/wish';
import { storedFilenameSchema } from '@/shared/schemas/file';

type UploadTicket = { url: string; fields: Record<string, string>; filename: string };
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_WISH_IMAGE_BYTES = 750 * 1024;

function query(wishId: number) {
  return new URLSearchParams({ resourceType: 'wish', resourceId: String(wishId) }).toString();
}

export async function getWishImageUrl(filename: string, wishId: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  const response = await webApiClient.get<{ url: string }>(`/files/${encodeURIComponent(safeFilename)}?${query(wishId)}`);
  return validatePresignedUrl(response.data.url);
}

export async function uploadWishImage(file: File, wishId: number) {
  if (!ALLOWED_TYPES.has(file.type) || file.size < 1 || file.size > MAX_WISH_IMAGE_BYTES) {
    throw new Error('La photo doit être au format JPEG, PNG ou WebP et ne pas dépasser 750 Ko.');
  }
  const response = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    resourceType: 'wish',
    resourceId: wishId,
  });
  const ticket = response.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', file);
  const upload = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!upload.ok) throw new Error('Le transfert de la photo a échoué.');
  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename,
    contentType: file.type,
    resourceType: 'wish',
    resourceId: wishId,
  });
  return wishFilenameSchema.parse(ticket.filename);
}

export async function deleteOrphanWishImage(filename: string, wishId: number) {
  const safeFilename = storedFilenameSchema.parse(filename);
  await webApiClient.delete(`/files/${encodeURIComponent(safeFilename)}?${query(wishId)}`);
}
