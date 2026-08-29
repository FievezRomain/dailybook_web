import 'server-only';

import type { NextRequest } from 'next/server';

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');

  // Browser form/fetch mutations are expected to carry Origin. Rejecting a
  // missing value keeps session endpoints closed to non-browser cross-site calls.
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get('host');
    if (!requestHost || originUrl.host !== requestHost) return false;

    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const requestProtocol = forwardedProtocol ? `${forwardedProtocol}:` : request.nextUrl.protocol;
    return originUrl.protocol === requestProtocol;
  } catch {
    return false;
  }
}
