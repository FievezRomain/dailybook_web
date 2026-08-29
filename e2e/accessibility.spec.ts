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
