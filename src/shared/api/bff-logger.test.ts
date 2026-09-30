import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { normalizeUpstreamRoute, writeBffLog } from './bff-logger';

describe('journalisation BFF', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('écrit une ligne JSON compacte sans ajouter de contenu implicite', () => {
    const output = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    writeBffLog('warn', 'bff_request_rejected', {
      requestId: 'request-1', status: 403, errorCode: 'INVALID_CSRF_TOKEN',
    });

    expect(output).toHaveBeenCalledOnce();
    const entry = JSON.parse(String(output.mock.calls[0][0]));
    expect(entry).toMatchObject({
      level: 'warn', service: 'vasco-web-bff', event: 'bff_request_rejected',
      requestId: 'request-1', status: 403, errorCode: 'INVALID_CSRF_TOKEN',
    });
    expect(entry).not.toHaveProperty('token');
  });

  it('retire les paramètres et identifiants techniques des routes amont', () => {
    expect(normalizeUpstreamRoute('api/v1/events/42?scope=series')).toBe('/api/v1/events/:id');
    expect(normalizeUpstreamRoute('/api/v1/files/0123456789abcdef0123456789abcdef.jpg'))
      .toBe('/api/v1/files/:file');
    expect(normalizeUpstreamRoute('/api/v1/events/42/documents/compte%20rendu.pdf'))
      .toBe('/api/v1/events/:id/documents/:file');
    expect(normalizeUpstreamRoute('/api/v1/files/download-urls')).toBe('/api/v1/files/download-urls');
  });
});
