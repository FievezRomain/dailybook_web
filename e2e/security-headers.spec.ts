import { expect, test } from '@playwright/test';

const GLOBAL_HEADERS = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};

test('les pages reçoivent une CSP avec nonce sans bloquer le runtime Next', async ({ page }) => {
  const cspViolations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
      cspViolations.push(message.text());
    }
  });
  const response = await page.goto('/login');
  expect(response?.ok()).toBe(true);
  for (const [name, value] of Object.entries(GLOBAL_HEADERS)) {
    expect(response?.headers()[name]).toBe(value);
  }
  expect(response?.headers()['permissions-policy']).toContain('geolocation=(self)');

  const csp = response?.headers()['content-security-policy'];
  expect(csp).toBeDefined();
  if (!csp) throw new Error('CSP absente');
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=_-]+' 'strict-dynamic'/);
  expect(csp).not.toContain("'unsafe-eval'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Je me connecte' })).toBeVisible();
  expect(cspViolations).toEqual([]);
});

test('les réponses API reçoivent aussi les headers globaux', async ({ request }) => {
  const response = await request.get('/api/me');
  expect(response.status()).toBe(401);
  for (const [name, value] of Object.entries(GLOBAL_HEADERS)) {
    expect(response.headers()[name]).toBe(value);
  }
});
