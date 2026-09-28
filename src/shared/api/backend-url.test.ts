import { describe, expect, it } from 'vitest';
import { resolveBackendApiUrl } from './backend-url';

describe('resolveBackendApiUrl', () => {
  it.each([
    ['http://localhost:8080', 'http://localhost:8080'],
    ['https://api.vasco.example/', 'https://api.vasco.example'],
  ])('accepte une origine backend sans chemin', (value, expected) => {
    expect(resolveBackendApiUrl(value)).toBe(expected);
  });

  it.each([
    undefined,
    'localhost:8080',
    'ftp://api.vasco.example',
    'https://api.vasco.example/api/v1',
    'https://user:secret@api.vasco.example',
    'https://api.vasco.example?token=secret',
  ])('refuse une configuration ambiguë ou sensible: %s', (value) => {
    expect(() => resolveBackendApiUrl(value)).toThrow('Service indisponible.');
  });
});
