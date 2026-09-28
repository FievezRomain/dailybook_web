import { expect, test, type Page } from '@playwright/test';
import {
  createVerifiedFirebaseUser,
  exchangeIdTokenForSession,
} from './firebase-auth.fixture';

const currentUser = {
  id: 1, name: 'Vasco', email: 'vasco@example.test', picture: null, expotoken: null,
  timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium',
};

const ownerAnimal = {
  id: 1, nom: 'Aria', espece: 'Chat', datenaissance: '2020-01-02', provenance: 'owner',
};

const sharedAnimal = {
  id: 2, nom: 'Nox', espece: 'Chien', datenaissance: '2019-03-04', provenance: 'shared',
};

async function mockAnimalWorkspace(page: Page, animals: Array<Record<string, unknown>>) {
  await page.route('**/api/me', (route) => route.fulfill({ json: currentUser }));
  await page.route('**/api/events', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/animals/*', async (route) => {
    const request = route.request();
    const id = Number(request.url().split('/').pop());
    const index = animals.findIndex((animal) => animal.id === id);
    if (request.method() === 'PUT' && index >= 0) {
      const updated = { ...animals[index], ...(request.postDataJSON() as Record<string, unknown>) };
      animals[index] = updated;
      return route.fulfill({ json: updated });
    }
    if (request.method() === 'DELETE' && index >= 0) {
      animals.splice(index, 1);
      return route.fulfill({ status: 204 });
    }
    return route.fallback();
  });
  await page.route('**/api/animals/*/body-pictures', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/animals/*/history/*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/animals', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') return route.fulfill({ json: animals });
    if (request.method() === 'POST') {
      const input = request.postDataJSON() as Record<string, unknown>;
      const animal = { id: 3, provenance: 'owner', ...input };
      animals.push(animal);
      return route.fulfill({ json: animal });
    }
    return route.fallback();
  });
}

test.describe('parcours Animaux', () => {
  test('FLOW-05 : sélection, permissions et suivi restent cohérents', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const animals: Array<Record<string, unknown>> = [{ ...ownerAnimal }, { ...sharedAnimal }];
    let historyInput: Record<string, unknown> | undefined;
    let updateInput: Record<string, unknown> | undefined;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockAnimalWorkspace(page, animals);
      await page.route('**/api/animals/1', async (route) => {
        updateInput = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({ json: { ...ownerAnimal, ...updateInput } });
      });
      await page.route('**/api/animals/1/history', async (route) => {
        if (route.request().method() === 'POST') {
          historyInput = route.request().postDataJSON() as Record<string, unknown>;
          return route.fulfill({ json: { ...ownerAnimal } });
        }
        return route.fulfill({ json: [] });
      });

      await page.goto('/animals');
      await expect(page.getByRole('radio', { name: /Aria/ })).toBeChecked();
      await expect(page.getByLabel('Options animal')).toBeVisible();
      await page.getByLabel('Options animal').focus();
      await page.getByLabel('Options animal').press('Enter');
      await expect(page.getByRole('menuitem', { name: 'Modifier' })).toBeVisible();
      await page.getByRole('menuitem', { name: 'Modifier' }).click();
      await page.locator('input[name="race"]').fill('Européen');
      await page.getByRole('button', { name: 'Continuer' }).click();
      await expect(page.getByRole('heading', { name: 'Caractéristiques', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await expect(page.getByRole('heading', { name: 'Quotidien', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await expect(page.getByRole('heading', { name: 'Compléments', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Enregistrer les modifications' }).evaluate((button: HTMLButtonElement) => button.click());
      await expect.poll(() => updateInput).toMatchObject({ race: 'Européen' });

      await page.getByRole('tab', { name: 'Poids' }).click();
      await page.getByRole('spinbutton', { name: 'Poids' }).fill('4.2');
      await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
      await expect.poll(() => historyInput).toMatchObject({ value: 4.2, unity: 'kg' });

      await page.getByRole('radio', { name: /Nox/ }).click();
      await expect(page.getByText('Partagé', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Options animal')).toHaveCount(0);
      await expect(page.getByText('Historique partagé en lecture seule.')).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('FLOW-06 : créer un animal depuis l’état vide envoie les données requises', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const animals: Array<Record<string, unknown>> = [];
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockAnimalWorkspace(page, animals);

      await page.goto('/animals');
      await page.getByRole('button', { name: 'Créer' }).click();
      await page.getByRole('button', { name: /^Animal\b/ }).click();
      await expect(page.getByRole('dialog', { name: 'Ajouter un animal' })).toBeVisible();
      await page.locator('input[name="nom"]').fill('Moka');
      await page.getByRole('combobox', { name: 'Espèce *' }).click();
      await page.getByRole('option', { name: 'Chat', exact: true }).click();
      await page.locator('input[name="datenaissance"]').fill('2022-05-06');
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Continuer' }).click();
      await page.getByRole('button', { name: 'Ajouter l’animal' }).click();

      await expect.poll(() => animals).toContainEqual(expect.objectContaining({
        nom: 'Moka', espece: 'Chat', datenaissance: '2022-05-06', provenance: 'owner',
      }));
      await expect(page.getByRole('heading', { name: 'Moka', exact: true })).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('la suppression propriétaire demande confirmation puis rafraîchit la sélection', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const animals: Array<Record<string, unknown>> = [{ ...ownerAnimal }];
    let deleted = false;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockAnimalWorkspace(page, animals);
      await page.route('**/api/animals/1', async (route) => {
        deleted = route.request().method() === 'DELETE';
        animals.splice(0, 1);
        await route.fulfill({ status: 204 });
      });

      await page.goto('/animals');
      await page.getByLabel('Options animal').focus();
      await page.getByLabel('Options animal').press('Enter');
      await page.getByRole('menuitem', { name: 'Supprimer' }).click();
      await expect(page.getByRole('dialog', { name: 'Confirmer la suppression' })).toBeVisible();
      await page.getByRole('button', { name: 'Supprimer', exact: true }).last().click();
      await expect.poll(() => deleted).toBe(true);
      await expect(page.getByRole('heading', { name: 'Votre espace animaux est prêt' })).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('le compte Essentiel conserve la consultation et explicite les fonctions Premium', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockAnimalWorkspace(page, [{ ...ownerAnimal }]);
      await page.route('**/api/me', (route) => route.fulfill({ json: { ...currentUser, subscription: 'Essentiel' } }));

      await page.goto('/animals');
      await expect(page.getByText('Suivi photo mensuel')).toBeVisible();
      await expect(page.getByText('Documents médicaux')).toBeVisible();
      await expect(page.getByText('Informations générales')).toBeVisible();
      await expect(page.getByLabel('Options animal')).toBeVisible();
    } finally {
      await user.cleanup();
    }
  });

  test('le suivi photo Premium transfère et rattache une image mensuelle', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const filename = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png';
    let bodyPictureInput: Record<string, unknown> | undefined;
    let uploadCompleted = false;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockAnimalWorkspace(page, [{ ...ownerAnimal }]);
      await page.route('**/api/animals/1/body-pictures', async (route) => {
        if (route.request().method() === 'POST') {
          bodyPictureInput = route.request().postDataJSON() as Record<string, unknown>;
          return route.fulfill({ json: { id: 10, idanimal: 1, ...bodyPictureInput } });
        }
        return route.fulfill({ json: [] });
      });
      await page.route('**/api/files/upload-url', (route) => route.fulfill({ json: {
        url: 'https://storage.example/upload', fields: {}, filename,
      } }));
      await page.route('**/api/files/upload-complete', async (route) => {
        uploadCompleted = route.request().postDataJSON().filename === filename;
        await route.fulfill({ status: 204 });
      });
      await page.route('https://storage.example/**', (route) => route.fulfill({ status: 204 }));

      await page.goto('/animals');
      await page.locator('input[name="image"][accept="image/jpeg,image/png,image/webp"]').setInputFiles({
        name: 'suivi.png', mimeType: 'image/png', buffer: Buffer.from('image'),
      });
      await expect.poll(() => bodyPictureInput).toMatchObject({ filename });
      await expect.poll(() => uploadCompleted).toBe(true);
    } finally {
      await user.cleanup();
    }
  });

  test('un échec de chargement reste actionnable avec une relance', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    let animalRequests = 0;
    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await page.route('**/api/me', (route) => route.fulfill({ json: currentUser }));
      await page.route('**/api/events', (route) => route.fulfill({ json: [] }));
      await page.route('**/api/animals', async (route) => {
        animalRequests += 1;
        if (animalRequests <= 2) return route.fulfill({ status: 500, json: { message: 'Indisponible' } });
        return route.fulfill({ json: [{ ...ownerAnimal }] });
      });

      await page.goto('/animals');
      await expect(page.getByRole('alert').filter({ has: page.getByRole('button', { name: 'Réessayer' }) })).toContainText('Indisponible');
      await page.getByRole('button', { name: 'Réessayer' }).click();
      await expect(page.getByRole('heading', { name: 'Aria', exact: true })).toBeVisible();
      expect(animalRequests).toBeGreaterThanOrEqual(3);
    } finally {
      await user.cleanup();
    }
  });

  for (const [name, width] of [['Wide', 1440], ['Medium', 1024], ['Compact', 390]] as const) {
    test(`la fiche Animal reste sans débordement au format ${name}`, async ({ context, page, request }) => {
      const user = await createVerifiedFirebaseUser(request);
      try {
        await exchangeIdTokenForSession(context, user.idToken);
        await mockAnimalWorkspace(page, [{ ...ownerAnimal }]);
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/animals');
        await expect(page.getByRole('heading', { name: 'Informations générales' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Carnet de santé' })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      } finally {
        await user.cleanup();
      }
    });
  }
});
