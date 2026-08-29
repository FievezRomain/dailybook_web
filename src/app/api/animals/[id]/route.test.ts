import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PUT } from './route';

function request(method: 'PUT' | 'DELETE', body?: unknown) {
  return new Request('http://localhost/api/animals/4', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/animals/[id]', () => {
  beforeEach(() => vi.clearAllMocks());
  const context = { params: Promise.resolve({ id: '4' }) };

  it('transmet une mise à jour partielle et lie l’id du chemin', async () => {
    backendApiClient.mockResolvedValue({ id: 4, nom: 'Nala', provenance: 'owner', image: null });
    const response = await PUT(request('PUT', { nom: 'Nala', image: null }), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4', 'PUT', { id: 4, nom: 'Nala', image: null });
  });

  it('refuse une mutation vide', async () => {
    expect((await PUT(request('PUT', {}), context)).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('supprime par la route REST courante', async () => {
    const response = await DELETE(request('DELETE'), context);
    expect(response.status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4', 'DELETE');
  });
});
