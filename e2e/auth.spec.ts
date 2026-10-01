import { expect, test } from '@playwright/test';
import { format } from 'date-fns';
import {
  createVerifiedFirebaseUser,
  exchangeIdTokenForSession,
  expireEmulatorSessionCookie,
} from './firebase-auth.fixture';

const PRIVATE_ROUTES = ['/dashboard', '/animals', '/calendar', '/profile', '/performances/objectives'];
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

  test('le premier accès mémorise localement le passage de l’onboarding', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route('**/api/animals', (route) => route.fulfill({ json: [] }));
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/objectives', (route) => route.fulfill({ json: [] }));

      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Bienvenue dans votre espace Vasco.' })).toBeVisible();
      await page.getByRole('button', { name: 'Passer cette étape' }).click();
      await expect(page.getByRole('button', { name: 'Utiliser ma position' })).toBeVisible();
      await expect(page.evaluate(() => localStorage.getItem('vasco:onboarding-complete'))).resolves.toBe('true');

      await page.reload();
      await expect(page.getByRole('heading', { name: 'Bienvenue dans votre espace Vasco.' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Utiliser ma position' })).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('l’Agenda ouvre une création contextuelle avec les types d’événement', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [] }));
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: 'Créer' }).click();
      await page.getByRole('button', { name: /^Événement\b/ }).click();
      for (const type of ['Soins', 'Rendez-vous médical', 'Balade', 'Entraînement', 'Concours', 'Dépense', 'Autre']) {
        await expect(page.getByRole('button', { name: new RegExp(type) })).toBeVisible();
      }
    } finally {
      await user.cleanup();
    }
  });

  test('l’Agenda reste sans débordement au format Medium', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [] }));
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));

      await page.goto('/calendar');
      await expect(page.getByRole('heading', { name: 'Agenda' })).toBeVisible();
      await expect(page.getByRole('grid', { name: /Calendrier/ })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    } finally {
      await user.cleanup();
    }
  });

  test('l’Agenda permet de modifier un événement depuis son détail', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [{
        id: 8,
        nom: 'Vaccin annuel',
        dateevent: format(new Date(), 'yyyy-MM-dd'),
        animaux: [],
        eventtype: 'rdv',
        state: 'À faire',
        documents: [],
        shared_groups: [],
      }] }));
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: 'Ouvrir Vaccin annuel', exact: true }).click();
      await expect(page.getByRole('dialog').getByRole('heading', { name: 'Vaccin annuel' })).toBeVisible();
      await page.getByRole('button', { name: 'Modifier l’événement' }).click();
      await expect(page.getByRole('dialog', { name: 'Modifier rendez-vous médical' })).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('l’Agenda soumet une création avec son type et son animal', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    let createdEvent: Record<string, unknown> | undefined;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, async (route) => {
        if (route.request().method() === 'POST') {
          createdEvent = route.request().postDataJSON() as Record<string, unknown>;
          await route.fulfill({ json: {
            id: 9,
            ...createdEvent,
            documents: [],
            shared_groups: [],
          } });
          return;
        }
        await route.fulfill({ json: [] });
      });
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [{ id: 3, nom: 'Aria', provenance: 'owner' }] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: 'Créer' }).click();
      await page.getByRole('button', { name: /^Événement\b/ }).click();
      await page.getByRole('button', { name: /Rendez-vous/ }).click();
      await page.locator('input[name="nom"]').fill('Rappel clinique');
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Tous' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Créer l’événement' }).click();

      await expect.poll(() => createdEvent).toMatchObject({
        nom: 'Rappel clinique',
        eventtype: 'rdv',
        animaux: [3],
      });
    } finally {
      await user.cleanup();
    }
  });

  test('l’Agenda soumet la portée choisie pour une modification récurrente', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    let updateInput: Record<string, unknown> | undefined;
    const recurringEvent = {
      id: 8,
      nom: 'Soin récurrent',
      dateevent: '2026-09-05',
      animaux: [3],
      eventtype: 'soins',
      state: 'À faire',
      documents: [],
      shared_groups: [],
      frequencetype: 'recurring',
      frequencevalue: 'weekly',
      datefinsoins: '2026-12-31',
      idparent: 5,
    };
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [recurringEvent] }));
      await page.route('**/api/events/8', async (route) => {
        updateInput = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ json: [{ ...recurringEvent, ...updateInput }] });
      });
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [{ id: 3, nom: 'Aria', provenance: 'owner' }] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: /Soin récurrent/ }).click();
      await page.getByRole('button', { name: 'Modifier l’événement' }).click();
      await page.locator('input[name="nom"]').fill('Soin ajusté');
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByLabel('Cette occurrence et les suivantes').check();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();

      await expect.poll(() => updateInput).toMatchObject({
        nom: 'Soin ajusté',
        update_scope: 'following',
        frequencevalue: 'weekly',
      });
    } finally {
      await user.cleanup();
    }
  });

  test('une série récurrente partage uniquement avec un groupe compatible', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    let updateInput: Record<string, unknown> | undefined;
    const recurringEvent = {
      id: 8,
      nom: 'Soin partagé',
      dateevent: '2026-09-05',
      animaux: [3],
      eventtype: 'soins',
      state: 'À faire',
      documents: [],
      shared_groups: [],
      frequencetype: 'recurring',
      frequencevalue: 'weekly',
      datefinsoins: '2026-12-31',
      idparent: 5,
    };
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [recurringEvent] }));
      await page.route('**/api/events/8', async (route) => {
        updateInput = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ json: [{ ...recurringEvent, ...updateInput }] });
      });
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [{ id: 3, nom: 'Aria', provenance: 'owner' }] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [{
        id: 11,
        name: 'Écurie Vasco',
        nb_members: 2,
        data: { animals: [{ type: 'accepted', items: [{ id: 3, nom: 'Aria' }] }], members: [] },
      }] }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: /Soin partagé/ }).click();
      await page.getByRole('button', { name: 'Modifier l’événement' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByLabel('Toute la série').check();
      await page.getByLabel('Écurie Vasco').check();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();

      await expect.poll(() => updateInput).toMatchObject({
        update_scope: 'series',
        shared_groups: [11],
      });
    } finally {
      await user.cleanup();
    }
  });

  test('la modification retire un document lié via le BFF', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const filename = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.pdf';
    let updateInput: Record<string, unknown> | undefined;
    let deletedDocument = false;
    const event = {
      id: 8,
      nom: 'Contrôle documenté',
      dateevent: '2026-09-05',
      animaux: [3],
      eventtype: 'rdv',
      state: 'À faire',
      documents: [{ name: filename }],
      shared_groups: [],
    };
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [event] }));
      await page.route('**/api/events/8', async (route) => {
        updateInput = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ json: [{ ...event, ...updateInput }] });
      });
      await page.route(`**/api/events/8/documents/${filename}`, async (route) => {
        deletedDocument = route.request().method() === 'DELETE';
        await route.fulfill({ status: 204 });
      });
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [{ id: 3, nom: 'Aria', provenance: 'owner' }] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/me', (route) => route.fulfill({ json: {
        id: 1, name: 'Vasco', email: 'vasco@example.test', picture: null, expotoken: null,
        timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium',
      } }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: /Contrôle documenté/ }).click();
      await page.getByRole('button', { name: 'Modifier l’événement' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Retirer' }).first().click();
      await page.getByRole('dialog', { name: 'Retirer ce document médical ?' }).getByRole('button', { name: 'Retirer' }).click();
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();

      await expect.poll(() => updateInput?.documents).toEqual([]);
      await expect.poll(() => deletedDocument).toBe(true);
    } finally {
      await user.cleanup();
    }
  });

  test('la modification charge et rattache un document Premium', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const filename = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.pdf';
    let updateInput: Record<string, unknown> | undefined;
    let uploadCompleted = false;
    const event = {
      id: 8,
      nom: 'Contrôle à joindre',
      dateevent: '2026-09-05',
      animaux: [3],
      eventtype: 'rdv',
      state: 'À faire',
      documents: [],
      shared_groups: [],
    };
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route(/\/api\/events(?:\?.*)?$/, (route) => route.fulfill({ json: [event] }));
      await page.route('**/api/events/8', async (route) => {
        updateInput = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ json: [{ ...event, ...updateInput }] });
      });
      await page.route('**/api/files/upload-url', (route) => route.fulfill({ json: {
        url: 'https://storage.example/upload', fields: {}, filename,
      } }));
      await page.route('**/api/files/upload-complete', async (route) => {
        uploadCompleted = route.request().postDataJSON().filename === filename;
        await route.fulfill({ status: 204 });
      });
      await page.route('https://storage.example/**', (route) => route.fulfill({ status: 204 }));
      await page.route(/\/api\/events\/highlights/, (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', (route) => route.fulfill({ json: [{ id: 3, nom: 'Aria', provenance: 'owner' }] }));
      await page.route('**/api/groups', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/me', (route) => route.fulfill({ json: {
        id: 1, name: 'Vasco', email: 'vasco@example.test', picture: null, expotoken: null,
        timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium',
      } }));

      await page.goto('/calendar');
      await page.getByRole('button', { name: /Contrôle à joindre/ }).click();
      await page.getByRole('button', { name: 'Modifier l’événement' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.locator('input[name="documents"]').setInputFiles({ name: 'bilan.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();

      await expect.poll(() => updateInput?.documents).toEqual([filename]);
      await expect.poll(() => uploadCompleted).toBe(true);
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
