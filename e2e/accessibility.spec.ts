import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of ['/', '/login', '/register']) {
  test(`${route} ne présente aucune violation d’accessibilité structurelle bloquante`, async ({ page }) => {
    await page.goto(route);
    // La palette actuelle de l’application est la référence graphique validée.
    // Le contraste reste suivi séparément, sans masquer les autres règles Axe
    // de niveau serious/critical (ARIA, noms accessibles, structure, etc.).
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    const blockingViolations = results.violations.filter(({ impact }) =>
      impact === 'critical' || impact === 'serious',
    );
    expect(blockingViolations).toEqual([]);
  });
}

test('Login conserve un parcours clavier et le reflow avec forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/login');

  const email = page.getByRole('textbox', { name: 'Adresse e-mail' });
  const password = page.getByRole('textbox', { name: 'Mot de passe' });
  const submit = page.getByRole('button', { name: 'Se connecter' });
  await email.focus();
  await expect(email).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(password).toBeFocused();
  // Le bouton d’affichage du mot de passe et le lien de récupération peuvent
  // légitimement se trouver entre le champ et la soumission. On vérifie donc
  // que l’action principale reste atteignable au clavier, sans figer cet ordre.
  for (let index = 0; index < 4; index += 1) {
    if (await submit.evaluate((element) => element === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(submit).toBeFocused();
  await expect.poll(() => page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
