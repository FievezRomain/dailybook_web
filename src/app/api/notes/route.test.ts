import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const note = {
  id: 2, titre: 'Suivi', note: 'Texte **Markdown**', is_pinned: true,
  created_at: '2026-08-24T09:00:00+00:00', updated_at: null, content_format: 'markdown',
};
function request(body: unknown) {
  return new Request('http://localhost/api/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/notes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide les métadonnées nullables de la liste courante', async () => {
    backendApiClient.mockResolvedValue([note, { ...note, id: 3, created_at: null }]);
    expect((await GET()).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notes');
  });

  it('crée uniquement une note Markdown validée', async () => {
    backendApiClient.mockResolvedValue(note);
    const body = { titre: 'Suivi', note: 'Texte **Markdown**', is_pinned: true };
    expect((await POST(request(body))).status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notes', 'POST', body);
  });

  it('refuse un titre vide et les champs techniques injectés', async () => {
    expect((await POST(request({ titre: ' ' }))).status).toBe(422);
    expect((await POST(request({ titre: 'Note', email: 'attacker@example.com' }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
