import { expect, test, type Page } from '@playwright/test';
import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture';

async function mockCurrentUser(page: Page) {
  await page.route('**/api/me', route => route.fulfill({ json: { id: 1, name: 'Vasco', email: 'vasco@example.test', picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium' } }));
}

test.describe('I8 — Notes, Contacts et Souhaits', () => {
  test('FLOW-11 : crée une note puis ouvre son détail texte sûr', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const notes: Array<Record<string, unknown>> = [];
    try {
      await exchangeIdTokenForSession(context, user.idToken); await mockCurrentUser(page);
      await page.route('**/api/notes', route => route.request().method() === 'GET' ? route.fulfill({ json: notes }) : route.fulfill({ json: (() => { const created = { id: 1, ...route.request().postDataJSON(), created_at: '2026-09-06T00:00:00+00:00', updated_at: null, content_format: 'markdown' }; notes.push(created); return created; })() }));
      await page.goto('/notes');
      await page.getByRole('button', { name: 'Créer', exact: true }).first().click();
      await page.getByRole('button', { name: /Note/ }).click();
      await page.getByLabel('Titre').fill('Préparer le concours');
      await page.getByLabel('Contenu').fill('<script>texte sûr</script>');
      await page.getByRole('button', { name: 'Créer la note' }).click();
      await page.getByRole('button', { name: 'Préparer le concours', exact: true }).click();
      await expect(page.getByRole('main')).toContainText('<script>texte sûr</script>');
    } finally { await user.cleanup(); }
  });

  test('FLOW-12 : crée un contact et ouvre les coordonnées actionnables', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const contacts: Array<Record<string, unknown>> = [];
    try {
      await exchangeIdTokenForSession(context, user.idToken); await mockCurrentUser(page);
      await page.route('**/api/contacts', route => route.request().method() === 'GET' ? route.fulfill({ json: contacts }) : route.fulfill({ json: (() => { const body = route.request().postDataJSON() as Record<string, string>; const created = { id: 2, nom: body.nom, profession: body.profession, telephone: body.telephone, email: body.email_contact }; contacts.push(created); return created; })() }));
      await page.goto('/contacts');
      await page.getByRole('button', { name: 'Créer', exact: true }).first().click();
      await page.getByRole('button', { name: /Contact/ }).click();
      await page.getByLabel('Nom').fill('Clinique Vasco'); await page.getByLabel('Téléphone').fill('0102030405'); await page.getByLabel('E-mail').fill('clinique@vasco.test');
      await page.getByRole('button', { name: 'Créer le contact' }).click();
      await expect(page.getByRole('link', { name: /0102030405/ })).toHaveAttribute('href', 'tel:0102030405');
    } finally { await user.cleanup(); }
  });

  test('FLOW-13 : crée un souhait et ouvre le lien marchand sécurisé', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const wishes: Array<Record<string, unknown>> = [];
    try {
      await exchangeIdTokenForSession(context, user.idToken); await mockCurrentUser(page);
      await page.route('**/api/wishes', route => route.request().method() === 'GET' ? route.fulfill({ json: wishes }) : route.fulfill({ json: (() => { const created = { id: 3, ...route.request().postDataJSON(), acquis: false }; wishes.push(created); return created; })() }));
      await page.goto('/wishes');
      await page.getByRole('button', { name: 'Créer', exact: true }).first().click();
      await page.getByRole('button', { name: /Souhait/ }).click();
      await page.getByLabel('Nom').fill('Selle'); await page.getByLabel('Lien').fill('https://example.com/selle'); await page.getByRole('button', { name: 'Créer le souhait' }).click();
      await page.getByLabel('Selle', { exact: true }).click();
      await expect(page.getByRole('link', { name: /Voir le lien/ })).toHaveAttribute('rel', 'noopener noreferrer');
    } finally { await user.cleanup(); }
  });

  test('FLOW-13 : associe une image de souhait après ticket, transfert et finalisation', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const filename = `${'a'.repeat(32)}.png`;
    const wishes = [{ id: 3, nom: 'Selle', url: null, prix: null, destinataire: null, image: null, acquis: false }];
    const uploads: unknown[] = [];
    try {
      await exchangeIdTokenForSession(context, user.idToken); await mockCurrentUser(page);
      await page.route('**/api/wishes', route => route.fulfill({ json: wishes }));
      await page.route('**/api/files/upload-url', route => route.fulfill({ json: { url: 'https://storage.example/upload', fields: { key: filename }, filename } }));
      await page.route('https://storage.example/**', async route => { uploads.push({ method: route.request().method(), body: await route.request().postDataBuffer() }); await route.fulfill({ status: 204 }); });
      await page.route('**/api/files/upload-complete', route => route.fulfill({ json: {} }));
      await page.route('**/api/wishes/3', route => route.fulfill({ json: { ...wishes[0], ...(route.request().postDataJSON() as Record<string, unknown>) } }));
      await page.goto('/wishes');
      await page.getByRole('button', { name: 'Actions pour Selle' }).click();
      await page.getByRole('menuitem', { name: 'Modifier' }).click();
      await page.locator('input[type=file]').setInputFiles({ name: 'selle.png', mimeType: 'image/png', buffer: Buffer.from('small-png') });
      await page.getByRole('button', { name: 'Enregistrer' }).click();
      await expect.poll(() => uploads).toHaveLength(1);
      await expect(page.getByText('Souhait mis à jour.')).toBeVisible();
    } finally { await user.cleanup(); }
  });

  for (const [name, width] of [['Wide', 1440], ['Compact', 390]] as const) test(`I8 reste sans débordement ${name}`, async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken); await mockCurrentUser(page);
      await page.route('**/api/notes', route => route.fulfill({ json: [] })); await page.route('**/api/contacts', route => route.fulfill({ json: [] })); await page.route('**/api/wishes', route => route.fulfill({ json: [] }));
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/notes', '/contacts', '/wishes']) { await page.goto(path); await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true); }
    } finally { await user.cleanup(); }
  });
});
