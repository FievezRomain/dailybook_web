import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy, SECURITY_HEADERS } from './headers';

describe('security headers', () => {
  it('construit une CSP de production stricte avec les origines configurées', () => {
    const csp = buildContentSecurityPolicy('bm9uY2U=', false, {
      authDomain: 'vasco-test.firebaseapp.com',
      storageHostname: 'vasco-files.example.com',
    });

    expect(csp).toContain("script-src 'self' 'nonce-bm9uY2U=' 'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('*');
    expect(csp).toContain('https://vasco-test.firebaseapp.com');
    expect(csp).toContain('https://vasco-files.example.com');
    expect(csp).not.toContain('openweathermap.org');
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY='");
  });

  it('n’autorise unsafe-eval qu’en développement et ignore un hostname injecté', () => {
    const csp = buildContentSecurityPolicy('safe-nonce', true, {
      authDomain: "firebaseapp.com; script-src *",
      storageHostname: 'valid.example.com',
    });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).not.toContain('script-src *');
    expect(csp).toContain('https://valid.example.com');
  });

  it('refuse un nonce contenant des caractères actifs', () => {
    expect(() => buildContentSecurityPolicy('bad<nonce', false, {})).toThrow('Invalid CSP nonce');
  });

  it('déclare tous les headers globaux obligatoires', () => {
    expect(Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value]))).toMatchObject({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    expect(SECURITY_HEADERS.find(({ key }) => key === 'Permissions-Policy')?.value)
      .toContain('browsing-topics=()');
    expect(SECURITY_HEADERS.find(({ key }) => key === 'Permissions-Policy')?.value)
      .toContain('geolocation=(self)');
  });
});
