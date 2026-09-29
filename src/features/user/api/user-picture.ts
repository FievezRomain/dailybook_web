import { webApiClient } from '@/shared/api/web-api-client';
import { validatePresignedUrl } from '@/shared/security/presigned-url';
import { userPictureFilenameSchema } from '../schemas/user';

type UploadTicket = {
  url: string;
  fields: Record<string, string>;
  filename: string;
};

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_USER_IMAGE_BYTES = 500 * 1024;

export async function getUserPictureUrl(filename: string): Promise<string> {
  const safeFilename = userPictureFilenameSchema.parse(filename);
  const response = await webApiClient.get<{ url: string }>(`/files/${encodeURIComponent(safeFilename)}`);
  return validatePresignedUrl(response.data.url);
}

export async function uploadUserPicture(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type) || file.size < 1 || file.size > MAX_USER_IMAGE_BYTES) {
    throw new Error('La photo doit être au format JPEG, PNG ou WebP et ne pas dépasser 500 Ko.');
  }

  const ticketResponse = await webApiClient.post<UploadTicket>('/files/upload-url', {
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });
  const ticket = ticketResponse.data;
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  form.append('file', file);

  const uploadResponse = await fetch(validatePresignedUrl(ticket.url), { method: 'POST', body: form });
  if (!uploadResponse.ok) throw new Error('Le transfert de la photo a échoué.');

  await webApiClient.post('/files/upload-complete', {
    filename: ticket.filename,
    contentType: file.type,
  });
  try {
    await webApiClient.patch('/me', { image: ticket.filename });
  } catch (error) {
    await webApiClient.delete(`/files/${encodeURIComponent(ticket.filename)}`).catch(() => undefined);
    throw error;
  }
  return userPictureFilenameSchema.parse(ticket.filename);
}

export async function removeUserPicture(): Promise<void> {
  await webApiClient.patch('/me', { image: null });
}
