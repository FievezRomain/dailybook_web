import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const MAX_LOAD_DURATION_MS = 5_000;
const MAX_TRANSFER_SIZE_BYTES = 3_000_000;

for (const route of PUBLIC_ROUTES) {
  test(`${route} respecte les budgets réseau initiaux`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return {
        loadDuration: navigation?.loadEventEnd ?? Number.POSITIVE_INFINITY,
        transferSize: resources.reduce((total, resource) => total + resource.transferSize, 0),
      };
    });

    expect(metrics.loadDuration).toBeLessThan(MAX_LOAD_DURATION_MS);
    expect(metrics.transferSize).toBeLessThan(MAX_TRANSFER_SIZE_BYTES);
  });
}
