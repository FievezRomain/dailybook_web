import { describe, expect, it } from 'vitest';
import { safeReturnPath } from '@/shared/security/safe-return-path';

describe('safeReturnPath', () => {
  it('conserve uniquement une destination interne Vasco', () => {
    expect(safeReturnPath('/notifications#preferences')).toBe('/notifications#preferences');
    expect(safeReturnPath('//external.example')).toBe('/dashboard');
    expect(safeReturnPath('/\\external.example')).toBe('/dashboard');
    expect(safeReturnPath('/profile\nLocation: https://external.example')).toBe('/dashboard');
    expect(safeReturnPath(null)).toBe('/dashboard');
  });
});
