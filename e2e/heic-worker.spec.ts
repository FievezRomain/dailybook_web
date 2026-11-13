import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('le worker auto-hébergé décode un vrai HEIC sous la CSP de production', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/login');
  const fixture = await readFile(path.join(process.cwd(), 'e2e', 'fixtures', 'codec-smoke.heic'));

  const result = await page.evaluate((bytes) => new Promise<{ width: number; height: number; byteLength: number }>(
    (resolve, reject) => {
      const worker = new Worker('/workers/heic-decoder.worker.js', { type: 'module' });
      const timeout = window.setTimeout(() => {
        worker.terminate();
        reject(new Error('Délai de décodage HEIC dépassé.'));
      }, 15_000);
      worker.onmessage = ({ data }) => {
        window.clearTimeout(timeout);
        worker.terminate();
        if (!data.ok) {
          reject(new Error(data.message));
          return;
        }
        resolve({ width: data.width, height: data.height, byteLength: data.pixels.byteLength });
      };
      worker.onerror = (event) => {
        window.clearTimeout(timeout);
        worker.terminate();
        reject(new Error(event.message));
      };
      const buffer = new Uint8Array(bytes).buffer;
      worker.postMessage({ id: 'e2e-smoke', buffer }, [buffer]);
    },
  ), [...fixture]);

  expect(result).toEqual({ width: 8, height: 6, byteLength: 8 * 6 * 4 });
  expect(browserErrors).toEqual([]);
});
