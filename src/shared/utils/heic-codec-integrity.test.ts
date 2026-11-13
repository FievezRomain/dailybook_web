import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const EXPECTED_SHA256 = '832bfb37148038257e56216d165cfae24a8afaa7cae8fc0ddb1ef4bf495612a9';

describe('codec HEIC auto-hébergé', () => {
  it('reste identique au binaire audité et épinglé', async () => {
    const codec = await readFile(path.join(process.cwd(), 'public', 'wasm', 'heic_dec.wasm'));
    expect(createHash('sha256').update(codec).digest('hex')).toBe(EXPECTED_SHA256);
  });

  it.each([
    ['decode.js', 'decode.js'],
    ['utils.js', 'utils.js'],
    ['codec/dec/heic_dec.js', 'codec/dec/heic_dec.js'],
  ])('copie exactement le module épinglé %s', async (publicPath, packagePath) => {
    const [served, installed] = await Promise.all([
      readFile(path.join(process.cwd(), 'public', 'vendor', 'heic', ...publicPath.split('/'))),
      readFile(path.join(process.cwd(), 'node_modules', '@discourse', 'heic', ...packagePath.split('/'))),
    ]);
    expect(served.equals(installed)).toBe(true);
  });
});
