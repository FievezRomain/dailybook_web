import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PUT } from './route';

const context = { params: Promise.resolve({ id: '2' }) };
function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/notes/2', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/notes/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('modifie la note identifiée par le chemin', async () => {
    const note = { id: 2, titre: 'MAJ', note: '', is_pinned: false, content_format: 'markdown' };
    backendApiClient.mockResolvedValue(note);
    expect((await PUT(request('PUT', { titre: 'MAJ', note: '', is_pinned: false }), context)).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notes/2', 'PUT', { id: 2, titre: 'MAJ', note: '', is_pinned: false });
  });

  it('supprime la note par sa route REST', async () => {
    backendApiClient.mockResolvedValue({ message: 'Suppression réussie' });
    expect((await DELETE(request('DELETE'), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notes/2', 'DELETE');
  });
});
