import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dialogStyles = readFileSync(join(process.cwd(), 'src/styles/components/dialogs.css'), 'utf8');
const globalStyles = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

describe('surfaces des formulaires modaux', () => {
  it('conserve le header sur la même surface en thème sombre', () => {
    expect(globalStyles).toContain('@import "../styles/components/dialogs.css";');
    expect(dialogStyles).toContain('.dark [data-slot="dialog-content"] > [data-slot="dialog-header"]');
    expect(dialogStyles).toContain('background-color: inherit;');
  });
});
