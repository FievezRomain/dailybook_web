import { APIRequestContext, BrowserContext, expect } from '@playwright/test';
import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const PROJECT_ID = 'vasco-e2e';
const AUTH_EMULATOR_ORIGIN = 'http://127.0.0.1:9099';
const WEB_ORIGIN = 'http://localhost:3000';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

type EmulatorSignInResponse = { idToken: string; localId: string };

export async function createVerifiedFirebaseUser(request: APIRequestContext) {
  const email = `vasco-e2e-${crypto.randomUUID()}@example.test`;
  const password = `Vasco-${crypto.randomUUID()}-A1!`;
  const signUp = await request.post(
    `${AUTH_EMULATOR_ORIGIN}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(signUp.ok()).toBe(true);
  const created = (await signUp.json()) as EmulatorSignInResponse;

  const app = initializeApp({ projectId: PROJECT_ID }, `e2e-${created.localId}`);
  const auth = getAuth(app);
  await auth.updateUser(created.localId, { emailVerified: true });

  const signIn = await request.post(
    `${AUTH_EMULATOR_ORIGIN}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    { data: { email, password, returnSecureToken: true } },
  );
  expect(signIn.ok()).toBe(true);
  const identity = (await signIn.json()) as EmulatorSignInResponse;

  return {
    idToken: identity.idToken,
    revoke: () => auth.revokeRefreshTokens(identity.localId),
    cleanup: async () => {
      await auth.deleteUser(identity.localId).catch(() => undefined);
      await deleteApp(app);
    },
  };
}

export async function exchangeIdTokenForSession(context: BrowserContext, idToken: string) {
  const response = await context.request.post(`${WEB_ORIGIN}/api/session/login`, {
    headers: { Origin: WEB_ORIGIN },
    data: { idToken },
  });
  expect(response.status()).toBe(200);
  const session = (await context.cookies()).find((cookie) => cookie.name === '__Secure-vasco-session');
  expect(session).toBeDefined();
  expect(session!.secure).toBe(true);
  return session!.value;
}

export function expireEmulatorSessionCookie(sessionCookie: string) {
  const [header, payload, signature] = sessionCookie.split('.');
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  claims.exp = Math.floor(Date.now() / 1000) - 1;
  return [header, Buffer.from(JSON.stringify(claims)).toString('base64url'), signature].join('.');
}
