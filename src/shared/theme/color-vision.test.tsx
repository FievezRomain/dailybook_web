import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { colorVisionStorageKey, setColorVisionMode, useColorVisionMode } from './color-vision';

describe('color vision preference', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.colorVision;
  });

  it('active et persiste la palette accessible', () => {
    const { result } = renderHook(() => useColorVisionMode());
    expect(result.current.mode).toBe('standard');

    act(() => setColorVisionMode('accessible'));

    expect(result.current.mode).toBe('accessible');
    expect(localStorage.getItem(colorVisionStorageKey)).toBe('accessible');
    expect(document.documentElement.dataset.colorVision).toBe('accessible');
  });
});
