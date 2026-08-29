const MAX_PRESIGNED_URL_LENGTH = 8_192;

export function validatePresignedUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > MAX_PRESIGNED_URL_LENGTH) {
    throw invalidStorageUrl('URL de stockage invalide.');
  }
  const allowedHostname = configuredStorageHostname();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw invalidStorageUrl('URL de stockage invalide.');
  }
  if (
    url.protocol !== 'https:'
    || url.hostname.toLowerCase() !== allowedHostname
    || (url.port !== '' && url.port !== '443')
    || url.username !== ''
    || url.password !== ''
    || url.hash !== ''
  ) {
    throw invalidStorageUrl('URL de stockage refusée.');
  }
  return url.toString();
}

export function openPresignedUrl(value: unknown): void {
  const safeUrl = validatePresignedUrl(value);
  const opened = window.open(safeUrl, '_blank', 'noopener,noreferrer');
  if (opened) opened.opener = null;
}

function configuredStorageHostname(): string {
  const hostname = process.env.NEXT_PUBLIC_BUCKET_HOSTNAME?.trim().toLowerCase();
  if (!hostname || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) {
    throw new WebApiError({
      code: 'BFF_MISCONFIGURED', message: 'Le stockage Vasco est mal configuré.', status: 500,
    });
  }
  return hostname;
}

function invalidStorageUrl(message: string): WebApiError {
  return new WebApiError({ code: 'INVALID_STORAGE_URL', message, status: 502 });
}
import { WebApiError } from '@/shared/api/api-error';
