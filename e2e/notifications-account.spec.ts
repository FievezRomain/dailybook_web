import { expect, test, type Page } from '@playwright/test';
import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture';

const currentUser = {
  id: 1,
  name: 'Alice Vasco',
  email: 'alice@example.test',
  picture: null,
  expotoken: null,
  timezone: 'Europe/Paris',
  dailyReminderEnabled: true,
  subscription: 'Premium',
};

async function stubAccountRequests(page: Page) {
  await page.route('**/api/me', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ json: { ...currentUser, ...route.request().postDataJSON() } });
      return;
    }
    await route.fulfill({ json: currentUser });
  });
  await page.route('**/api/notifications', (route) => route.fulfill({ json: { notifications: [], unreadCount: 0 } }));
}

test.describe('I9 — compte et préférences d’apparence', () => {
  test('FLOW-15 vérifie Light/Dark × Standard/Accessible sans débordement', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await stubAccountRequests(page);
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto('/profile');
      await expect(page.getByRole('heading', { name: 'Mon compte', exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'standard');

      const themeToggle = page.getByRole('button', { name: 'Changer de thème' });
      const visionToggle = page.getByRole('button', { name: 'Activer le mode couleurs accessibles' });

      await themeToggle.click();
      await expect(page.locator('html')).toHaveClass(/dark/);
      await visionToggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'accessible');

      await themeToggle.click();
      await expect(page.locator('html')).not.toHaveClass(/dark/);
      await visionToggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'standard');
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    } finally {
      await user.cleanup();
    }
  });

  test('FLOW-14 accepte une invitation, la marque comme lue et conserve une action explicite', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    let invitationAccepted = false;
    let notificationRead = false;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route('**/api/me', (route) => route.fulfill({ json: currentUser }));
      await page.route('**/api/security/csrf', (route) => route.fulfill({ json: { csrfToken: 'e2e-token' } }));
      await page.route('**/api/notifications/3', async (route) => {
        notificationRead = route.request().method() === 'PATCH' && route.request().postDataJSON().is_read === true;
        await route.fulfill({ status: 204 });
      });
      await page.route('**/api/invitations/7', async (route) => {
        invitationAccepted = route.request().method() === 'PATCH' && route.request().postDataJSON().status === 'accepted';
        await route.fulfill({ json: null });
      });
      await page.route('**/api/notifications', (route) => route.fulfill({ json: {
        unreadCount: 1,
        notifications: [{ id: 3, type: 'group_member', title: 'Invitation à rejoindre Écurie Vasco', message: 'Rejoignez le groupe partagé.', object_id: 7, is_read: false, action_available: true, proposed_by: 'Camille', created_at: '2026-09-06T10:00:00Z' }],
      } }));

      await page.goto('/notifications');
      await page.getByRole('button', { name: 'Accepter' }).click();
      await expect(page.getByRole('dialog', { name: 'Accepter cette demande ?' })).toBeVisible();
      await page.getByRole('button', { name: 'Accepter' }).last().click();
      await expect.poll(() => invitationAccepted).toBe(true);
      await expect.poll(() => notificationRead).toBe(true);
    } finally {
      await user.cleanup();
    }
  });

  test('FLOW-16 redirige une session BFF expirée vers Login en conservant le retour interne', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route('**/api/me', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'UNAUTHENTICATED', status: 401, message: 'Session expirée' }) }));
      await page.goto('/profile');
      await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/);
    } finally {
      await user.cleanup();
    }
  });
});
