export type SecurityHeader = { key: string; value: string };

type CspOptions = {
  authDomain?: string;
  storageHostname?: string;
};

export const SECURITY_HEADERS: SecurityHeader[] = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()',
  },
];

export function buildContentSecurityPolicy(nonce: string, isDevelopment: boolean, options: CspOptions): string {
  if (!/^[A-Za-z0-9+/_=-]+$/.test(nonce)) throw new Error('Invalid CSP nonce');

  const authOrigin = toHttpsOrigin(options.authDomain);
  const storageOrigin = toHttpsOrigin(options.storageHostname);
  const connectSources = compact([
    "'self'",
    authOrigin,
    storageOrigin,
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
  ]);
  const imageSources = compact([
    "'self'", 'blob:', 'data:', storageOrigin,
  ]);

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    `style-src-elem 'self' 'nonce-${nonce}' `
      + "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' "
      + "'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY='",
    "style-src-attr 'unsafe-inline'",
    `img-src ${imageSources.join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(' ')}`,
    "worker-src 'self' blob:",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "manifest-src 'self'",
  ].join('; ');
}

function toHttpsOrigin(value?: string): string | undefined {
  if (!value) return undefined;
  const candidate = value.trim().toLowerCase();
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(candidate)) return undefined;
  return `https://${candidate}`;
}

function compact(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
