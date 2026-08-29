import { expect, test } from '@playwright/test';
import {
  createVerifiedFirebaseUser,
  exchangeIdTokenForSession,
  expireEmulatorSessionCookie,
} from './firebase-auth.fixture';

const PRIVATE_ROUTES = ['/dashboard', '/animals', '/calendar', '/profil', '/performances/objectives'];
const SESSION_COOKIE_NAME = '__Secure-vasco-session';

test.describe('protection anonyme', () => {
  for (const route of PRIVATE_ROUTES) {
    test(`${route} redirige vers la connexion`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test('/api/me refuse une requête sans session', async ({ request }) => {
    const response = await request.get('/api/me');
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: 'UNAUTHENTICATED',
      status: 401,
    });
  });
});

test.describe('session invalide', () => {
  test.use({
    extraHTTPHeaders: {
      cookie: `${SESSION_COOKIE_NAME}=invalid-session-cookie`,
    },
  });

  test('une page privée redirige vers la connexion', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('/api/me refuse le cookie', async ({ request }) => {
    const response = await request.get('/api/me');
    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: 'UNAUTHENTICATED',
      status: 401,
    });
  });
});

test('la création de session refuse un ID token invalide', async ({ page }) => {
  await page.goto('/login');
  const result = await page.evaluate(async () => {
    const response = await fetch('/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'invalid-id-token' }),
    });
    return { status: response.status, body: await response.json() };
  });
  expect(result.status).toBe(401);
  expect(result.body).toMatchObject({
    code: 'SESSION_CREATION_FAILED',
    status: 401,
  });
});

test.describe('cycle de vie Firebase Auth', () => {
  test.describe.configure({ mode: 'serial' });

  test('une connexion réussie crée une session Firebase utilisable', async ({ context, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      const response = await context.request.get('/dashboard', { maxRedirects: 0 });
      expect(response.status()).not.toBe(307);
    } finally {
      await user.cleanup();
    }
  });

  test('une session Firebase expirée est refusée', async ({ context, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      const sessionCookie = await exchangeIdTokenForSession(context, user.idToken);
      await context.addCookies([{
        name: SESSION_COOKIE_NAME,
        value: expireEmulatorSessionCookie(sessionCookie),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      }]);
      const response = await context.request.get('/dashboard', { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers().location).toBe('/login');
    } finally {
      await user.cleanup();
    }
  });

  test('une session Firebase révoquée est refusée', async ({ context, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      // Firebase compares auth_time and tokensValidAfterTime at whole-second precision.
      await new Promise((resolve) => setTimeout(resolve, 1_100));
      await user.revoke();
      const response = await context.request.get('/dashboard', { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers().location).toBe('/login');
    } finally {
      await user.cleanup();
    }
  });
});
