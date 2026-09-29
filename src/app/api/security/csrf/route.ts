import { randomBytes } from 'node:crypto';
import { CSRF_COOKIE_NAME } from '@/shared/api/bff-request';
import { bffSuccess } from '@/shared/api/bff-response';

export async function GET() {
  const token = randomBytes(32).toString('base64url');
  const response = bffSuccess({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
