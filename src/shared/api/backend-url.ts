import { WebApiError } from './api-error';

export function resolveBackendApiUrl(
  rawValue = process.env.VASCO_API_URL,
  requestId?: string,
): string {
  if (!rawValue) throw misconfiguredBackendUrl(requestId);

  try {
    const url = new URL(rawValue);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== '' && url.pathname !== '/')
    ) {
      throw misconfiguredBackendUrl(requestId);
    }
    return url.origin;
  } catch (error) {
    if (error instanceof WebApiError) throw error;
    throw misconfiguredBackendUrl(requestId);
  }
}

function misconfiguredBackendUrl(requestId?: string) {
  return new WebApiError({
    code: 'BFF_MISCONFIGURED',
    message: 'Service indisponible.',
    status: 500,
    requestId,
  });
}
