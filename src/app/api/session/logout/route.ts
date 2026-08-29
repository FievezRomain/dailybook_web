import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import { isSameOriginRequest } from '@/lib/auth/server/isSameOriginRequest';
import { NextRequest } from 'next/server';
import { WebApiError } from '@/shared/api/api-error';
import { bffError, bffSuccess } from '@/shared/api/bff-response';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return bffError(new WebApiError({
      code: 'INVALID_ORIGIN',
      message: 'Origine de requête refusée.',
      status: 403,
    }));
  }

  const response = bffSuccess({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
