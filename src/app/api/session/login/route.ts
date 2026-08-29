import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import { isSameOriginRequest } from '@/lib/auth/server/isSameOriginRequest';
import { WebApiError } from '@/shared/api/api-error';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { parseJson } from '@/shared/api/bff-request';
import { z } from 'zod';

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000;
const MAX_AUTH_AGE_SECONDS = 5 * 60;
const sessionRequestSchema = z.object({ idToken: z.string().min(1).max(16_384) }).strict();

export async function POST(req: NextRequest) {
  try {
    if (!isSameOriginRequest(req)) {
      return authError('INVALID_ORIGIN', 'Origine de requête refusée.', 403);
    }

    const body = await parseJson(req, sessionRequestSchema);

    const decodedToken = await adminAuth.verifyIdToken(body.idToken, true);
    const authenticatedAt = decodedToken.auth_time;
    const now = Math.floor(Date.now() / 1000);

    if (typeof authenticatedAt !== 'number' || now - authenticatedAt > MAX_AUTH_AGE_SECONDS) {
      return authError('RECENT_LOGIN_REQUIRED', 'Une authentification récente est requise.', 401);
    }

    if (!decodedToken.email_verified) {
      return authError('EMAIL_NOT_VERIFIED', 'L’adresse e-mail doit être vérifiée.', 403);
    }

    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const response = bffSuccess({ status: 'success' });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    if (error instanceof WebApiError || error instanceof z.ZodError || error instanceof SyntaxError) {
      return bffError(error);
    }
    return authError('SESSION_CREATION_FAILED', 'La session ne peut pas être créée.', 401);
  }
}

function authError(code: string, message: string, status: number) {
  return bffError(new WebApiError({ code, message, status }));
}
