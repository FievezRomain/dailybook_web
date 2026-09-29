import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

describe('palette Vasco', () => {
  it.each([
    ['gris', '#f8ebe8'],
    ['palomino', '#f6e6ce'],
    ['rouan', '#d3ccc9'],
    ['isabelle', '#c9b69f'],
    ['aubere', '#baa89b'],
    ['alezan', '#ce9871'],
    ['bai-cerise', '#b07165'],
    ['baie', '#956540'],
    ['bai-brun', '#694233'],
  ])('conserve la teinte %s', (name, value) => {
    expect(tokens).toContain(`--${name}: ${value};`);
  });

  it('utilise Baie comme couleur primaire du thème standard', () => {
    expect(tokens.match(/--primary: var\(--baie\);/g)).toHaveLength(2);
    expect(tokens).toContain('--checkbox-checked: var(--baie);');
  });

  it('réserve la palette de marque aux accents et garde les surfaces neutres', () => {
    expect(tokens).toContain('--background: #ffffff;');
    expect(tokens).toContain('--background: #0a0a0a;');
    expect(tokens).not.toContain('--foreground: var(--bai-brun);');
  });
});
