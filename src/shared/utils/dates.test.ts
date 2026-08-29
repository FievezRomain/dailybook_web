import { describe, expect, it } from 'vitest';
import { getLocalDateString } from './dates';

describe('getLocalDateString', () => {
  it('formate une date locale sans conversion UTC', () => {
    expect(getLocalDateString(new Date(2026, 7, 24, 23, 30))).toBe('2026-08-24');
  });
});
