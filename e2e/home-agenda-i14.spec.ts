import { expect, test, type Page } from '@playwright/test';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture';

const today = new Date();
const tomorrow = addDays(today, 1);

async function mockI14Data(page: Page) {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (route.request().method() !== 'GET') return route.fulfill({ json: {} });
    if (pathname === '/api/me') return route.fulfill({ json: { id: 1, name: 'Camille', email: 'camille@example.test', picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium' } });
    if (pathname === '/api/animals') return route.fulfill({ json: [
      { id: 2, nom: 'Aria', espece: 'Chat', datenaissance: '2020-01-02', provenance: 'owner' },
      { id: 3, nom: 'Nox', espece: 'Chien', datenaissance: '2021-04-12', provenance: 'owner' },
    ] });
    if (pathname === '/api/events') return route.fulfill({ json: [
      { id: 8, nom: 'Vaccin annuel', dateevent: format(today, 'yyyy-MM-dd'), animaux: [2], eventtype: 'rdv', state: 'À faire', heuredebutevent: '14:00', documents: [], shared_groups: [], todisplay: true },
      { id: 9, nom: 'Balade de Nox', dateevent: format(today, 'yyyy-MM-dd'), animaux: [3], eventtype: 'balade', state: 'À faire', heuredebutevent: '17:00', documents: [], shared_groups: [], todisplay: true },
      { id: 10, nom: 'Soin demain', dateevent: format(tomorrow, 'yyyy-MM-dd'), animaux: [2], eventtype: 'soins', state: 'À faire', heuredebutevent: '09:00', documents: [], shared_groups: [], todisplay: true },
    ] });
    if (pathname === '/api/events/highlights') return route.fulfill({ json: [] });
    if (pathname === '/api/weather/locations') return route.fulfill({ json: [
      { label: 'Vernais, Cher, France', latitude: 46.7656, longitude: 2.7129 },
    ] });
    if (pathname === '/api/weather') {
      const isVernais = new URL(route.request().url()).searchParams.get('latitude') === '46.77';
      return route.fulfill({ json: {
      location: { label: isVernais ? 'Vernais, France' : 'Paris, France', attribution: { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' } },
      current: { observedAt: '2026-09-09T12:00:00Z', symbolCode: 'partlycloudy_day', temperature: 18, humidity: 62, windSpeed: 3.4, precipitationNextHour: 0 },
      days: [{ date: '2026-09-09', symbolCode: 'partlycloudy_day', temperatureMin: 12, temperatureMax: 20, precipitation: 0, windSpeedMax: 5.1 }],
      attribution: { label: 'Données MET Norway', url: 'https://api.met.no/' },
    } });
    }
    if (pathname === '/api/objectifs') return route.fulfill({ json: [{
      id: 21,
      title: 'Préparer la reprise sportive',
      temporalityobjectif: 'Mois',
      datedebut: format(today, 'yyyy-MM-dd'),
      datefin: format(addDays(today, 30), 'yyyy-MM-dd'),
      animaux: [3],
      sousetapes: [
        { id: 31, etape: 'Planifier trois sorties', state: true, order: 1, objectif_id: 21 },
        { id: 32, etape: 'Augmenter progressivement la durée', state: false, order: 2, objectif_id: 21 },
      ],
    }] });
    if (pathname === '/api/notifications') return route.fulfill({ json: { notifications: [], unreadCount: 0 } });
    if (pathname === '/api/groups' || pathname === '/api/invitations') return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { code: 'I14_NOT_MOCKED', message: pathname } });
  });
}

test('clôture visuelle et interactive I14 pour Home et Agenda', async ({ context, page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Ce scénario parcourt déjà les formats desktop et mobile.')
  test.setTimeout(180_000);
  const user = await createVerifiedFirebaseUser(request);

  try {
    await exchangeIdTokenForSession(context, user.idToken);
    await mockI14Data(page);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 48.8566, longitude: 2.3522 });
    await page.addInitScript(() => {
      localStorage.setItem('vasco:onboarding-complete', 'true');
      localStorage.removeItem('vasco:dashboard-layouts');
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const todayTile = page.locator('.react-grid-item').filter({ has: page.getByRole('heading', { name: 'Aujourd’hui' }) });
    const upcomingTile = page.locator('.react-grid-item').filter({ has: page.getByRole('heading', { name: 'Prochains jours' }) });
    const todayBox = await todayTile.boundingBox();
    const upcomingBox = await upcomingTile.boundingBox();
    expect(Math.abs(todayBox!.width - upcomingBox!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(todayBox!.y - upcomingBox!.y)).toBeLessThanOrEqual(2);
    await page.getByRole('button', { name: 'Utiliser ma position' }).click();
    await expect(page.getByText('18 °C')).toBeVisible();
    await expect(page.getByText('Paris, France')).toBeVisible();
    await page.getByRole('button', { name: 'Choisir une autre ville' }).click();
    await page.getByRole('textbox', { name: 'Rechercher une ville pour la météo' }).fill('Vernais');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await page.getByRole('button', { name: 'Vernais, Cher, France' }).click();
    await expect(page.getByText('Vernais, France')).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('vasco:dashboard-layouts') ?? '{}').version)).toBe(6);
    const todayHandle = page.getByRole('button', { name: 'Déplacer Aujourd’hui par glisser-déposer' });
    await expect(todayHandle).toBeVisible();
    await expect(page.getByRole('button', { name: 'Organiser les tuiles' })).toHaveCount(0);
    const resizeHandle = todayTile.locator('.react-resizable-handle-se');
    await expect(resizeHandle).toBeVisible();
    const beforeResize = await todayTile.boundingBox();
    const resizeBox = await resizeHandle.boundingBox();
    await page.mouse.move(resizeBox!.x + resizeBox!.width / 2, resizeBox!.y + resizeBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(resizeBox!.x + 130, resizeBox!.y + 90, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => (await todayTile.boundingBox())!.width).toBeGreaterThan(beforeResize!.width);
    const upcomingHandle = page.getByRole('button', { name: 'Déplacer Prochains jours par glisser-déposer' });
    const beforeDrag = await upcomingTile.boundingBox();
    const directHandleBox = await upcomingHandle.boundingBox();
    await page.mouse.move(directHandleBox!.x + directHandleBox!.width / 2, directHandleBox!.y + directHandleBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(directHandleBox!.x - 220, directHandleBox!.y + 180, { steps: 8 });
    await page.mouse.up();
    await expect.poll(async () => {
      const afterDrag = await upcomingTile.boundingBox();
      return Math.abs(afterDrag!.x - beforeDrag!.x) + Math.abs(afterDrag!.y - beforeDrag!.y);
    }).toBeGreaterThan(20);
    await page.getByRole('button', { name: 'Réinitialiser les tuiles' }).click();
    await expect.poll(() => page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('vasco:dashboard-layouts') ?? '{}');
      return saved.layouts.lg.find((item: { i: string }) => item.i === 'objectives');
    })).toMatchObject({ x: 0, y: 4, w: 6 });

    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    const calendar = page.getByRole('grid', { name: /Calendrier/ });
    expect((await calendar.boundingBox())!.height).toBeGreaterThan(580);
    const calendarPanelHeight = (await page.locator('[data-calendar-panel]').boundingBox())!.height;
    const dayPanelHeight = (await page.locator('[data-day-panel]').boundingBox())!.height;
    expect(Math.abs(calendarPanelHeight - dayPanelHeight)).toBeLessThanOrEqual(2);
    await expect(page.getByText(/événements? dans l’agenda/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Filtres' }).click();
    const search = page.getByRole('searchbox', { name: 'Rechercher un événement' });
    expect(await search.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingLeft))).toBeGreaterThanOrEqual(40);
    await page.getByRole('button', { name: 'Aria', exact: true }).click();
    await expect(page.getByText('Balade de Nox', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Réinitialiser' }).click();
    await page.getByRole('button', { name: /Afficher 3 événements/ }).click();
    const tomorrowLabel = format(tomorrow, 'EEEE d MMMM', { locale: fr });
    const tomorrowCell = page.getByRole('gridcell', { name: new RegExp(tomorrowLabel, 'i') });
    await tomorrowCell.click();
    await expect(tomorrowCell).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: tomorrowLabel })).toBeVisible();
    const selectedEventCard = page.getByLabel('Carte d’événement Soin demain');
    await expect(selectedEventCard).toBeVisible();
    const calendarPill = tomorrowCell.locator('.event-calendar-pill').filter({ hasText: 'Soin demain' });
    await expect(calendarPill).toHaveCSS('background-color', 'rgb(201, 182, 159)');
    await selectedEventCard.getByRole('button', { name: 'Ouvrir Soin demain' }).click();
    const eventDialog = page.getByRole('dialog');
    await expect(eventDialog.getByRole('heading', { name: 'Soin demain' })).toBeVisible();
    await expect(eventDialog.getByText('Aria', { exact: true })).toBeVisible();
    await eventDialog.getByRole('button', { name: 'Fermer le détail' }).click();
    const keyboardDate = addDays(tomorrow, 1);
    const keyboardCell = page.getByRole('gridcell', { name: new RegExp(format(keyboardDate, 'EEEE d MMMM', { locale: fr }), 'i') });
    await keyboardCell.focus();
    await page.keyboard.press('Space');
    await expect(keyboardCell).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('button', { name: /Ajouter|Nouvel événement/ })).toHaveCount(0);

    for (const viewport of [{ name: 'medium', width: 1024, height: 768 }, { name: 'compact', width: 390, height: 844 }, { name: 'zoom-200', width: 720, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const [name, pathname] of [['home', '/dashboard'], ['agenda', '/calendar']] as const) {
        await page.goto(pathname);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('[data-page-title]')).toBeVisible();
        if (viewport.name === 'compact') {
          const navigation = page.getByRole('navigation', { name: 'Navigation principale' });
          for (const label of ['Accueil', 'Suivi', 'Agenda', 'Animaux', 'Autre']) await expect(navigation.getByText(label, { exact: true })).toBeVisible();
          if (name === 'agenda') {
            const compactEventCard = page.getByLabel('Carte d’événement Vaccin annuel');
            await compactEventCard.getByRole('button', { name: 'Ouvrir Vaccin annuel' }).click();
            const compactDetail = page.getByRole('dialog');
            await expect(compactDetail.getByRole('heading', { name: 'Vaccin annuel' })).toBeVisible();
            await expect(compactDetail.getByRole('button', { name: 'Fermer le détail' })).toBeVisible();
            await expect(compactDetail.getByRole('button', { name: 'Modifier l’événement' })).toBeVisible();
            expect((await compactDetail.boundingBox())!.width).toBeLessThanOrEqual(viewport.width);
            await compactDetail.getByRole('button', { name: 'Fermer le détail' }).click();
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
      }
    }

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Déplacer Aujourd’hui par glisser-déposer' })).toBeVisible();
    expect(await page.locator('.react-grid-item').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.1);
  } finally {
    await user.cleanup();
  }
});
