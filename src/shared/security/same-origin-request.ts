import 'server-only';

/**
 * Validate the browser Origin against the public request origin.
 *
 * Behind Traefik, request.url can contain Next.js' internal HTTP origin while
 * Host and X-Forwarded-Proto retain the public HTTPS origin. Comparing against
 * those proxy headers keeps the check strict without confusing internal and
 * public addresses.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const requestHost = request.headers.get('host') ?? requestUrl.host;
    const forwardedProtocol = firstHeaderValue(request.headers.get('x-forwarded-proto'));
    const requestProtocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;

    return originUrl.host === requestHost && originUrl.protocol === requestProtocol;
  } catch {
    return false;
  }
}

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(',')[0]?.trim().toLowerCase() || undefined;
}
