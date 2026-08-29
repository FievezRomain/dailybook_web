'use client';

import { useSyncExternalStore } from 'react';
import { colorVisionStorageKey } from './color-vision-bootstrap';

export { colorVisionStorageKey } from './color-vision-bootstrap';

export type ColorVisionMode = 'standard' | 'accessible';

const colorVisionEvent = 'vasco-color-vision-change';

function readMode(): ColorVisionMode {
  if (typeof window === 'undefined') return 'standard';
  return window.localStorage.getItem(colorVisionStorageKey) === 'accessible' ? 'accessible' : 'standard';
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(colorVisionEvent, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(colorVisionEvent, onStoreChange);
  };
}

export function setColorVisionMode(mode: ColorVisionMode) {
  window.localStorage.setItem(colorVisionStorageKey, mode);
  document.documentElement.dataset.colorVision = mode;
  window.dispatchEvent(new Event(colorVisionEvent));
}

export function useColorVisionMode() {
  const mode = useSyncExternalStore(subscribe, readMode, () => 'standard');
  return { mode, setMode: setColorVisionMode };
}
