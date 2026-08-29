import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('server-only', () => ({}));
vi.mock('./backend-api-client', () => ({ backendApiClient: vi.fn() }));

import { parseJson } from './bff-request';
import { bffError, bffNoContent, bffSuccess } from './bff-response';
import { WebApiError } from './api-error';

describe('frontières BFF', () => {
  it('ajoute un request ID et no-store aux succès', async () => {
    const response = bffSuccess({ ok: true });
    expect(response.headers.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ ok: true });

    const empty = bffNoContent('request-123');
    expect(empty.status).toBe(204);
    expect(empty.headers.get('x-request-id')).toBe('request-123');
  });

  it('produit une erreur Zod stable avec le même request ID dans le corps et le header', async () => {
    const schema = z.object({ name: z.string().min(1) }).strict();
    const parsed = schema.safeParse({ name: '', unexpected: true });
    if (parsed.success) throw new Error('La fixture doit être invalide');

    const response = bffError(parsed.error, 'request-zod');
    expect(response.status).toBe(422);
    expect(response.headers.get('x-request-id')).toBe('request-zod');
    await expect(response.json()).resolves.toMatchObject({
      code: 'VALIDATION_ERROR', status: 422, requestId: 'request-zod',
    });
  });

  it('distingue média non supporté et JSON mal formé', async () => {
    const schema = z.object({ value: z.string() });
    await expect(parseJson(new Request('http://localhost/api/test', {
      method: 'POST', body: '{}', headers: { 'content-type': 'text/plain' },
    }), schema)).rejects.toMatchObject({ code: 'UNSUPPORTED_MEDIA_TYPE', status: 415 });

    await expect(parseJson(new Request('http://localhost/api/test', {
      method: 'POST', body: '{', headers: { 'content-type': 'application/json' },
    }), schema)).rejects.toBeInstanceOf(SyntaxError);
  });

  it('conserve le request ID utilisé pour un appel backend en erreur', async () => {
    const response = bffError(new WebApiError({
      code: 'BACKEND_UNAVAILABLE', message: 'Indisponible.', status: 502, requestId: 'upstream-id',
    }));
    expect(response.headers.get('x-request-id')).toBe('upstream-id');
    await expect(response.json()).resolves.toMatchObject({ requestId: 'upstream-id' });
  });
});
