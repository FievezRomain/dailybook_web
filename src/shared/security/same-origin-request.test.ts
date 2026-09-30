import { describe, expect, it } from 'vitest';
import { isSameOriginRequest } from './same-origin-request';

describe('isSameOriginRequest', () => {
  it('accepte une requête locale de même origine', () => {
    const request = new Request('http://localhost/api/resource', {
      headers: { origin: 'http://localhost' },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it('utilise l’origine publique transmise par Traefik', () => {
    const request = new Request('http://vasco-frontend:3000/api/resource', {
      headers: {
        host: 'app.vascoandco.fr',
        origin: 'https://app.vascoandco.fr',
        'x-forwarded-proto': 'https',
      },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it.each([
    ['https://evil.example', 'app.vascoandco.fr', 'https'],
    ['http://app.vascoandco.fr', 'app.vascoandco.fr', 'https'],
  ])('refuse une origine différente (%s)', (origin, host, protocol) => {
    const request = new Request('http://vasco-frontend:3000/api/resource', {
      headers: { host, origin, 'x-forwarded-proto': protocol },
    });

    expect(isSameOriginRequest(request)).toBe(false);
  });

  it('refuse une requête sans en-tête Origin', () => {
    expect(isSameOriginRequest(new Request('http://localhost/api/resource'))).toBe(false);
  });
});
