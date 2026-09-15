import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const route of ['/', '/login', '/register']) {
  test(`${route} ne présente aucune violation d’accessibilité critique`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
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
  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();
  await expect.poll(() => page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
