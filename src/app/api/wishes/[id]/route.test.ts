import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PUT } from './route';

const context = { params: Promise.resolve({ id: '7' }) };
function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/wishes/7', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/wishes/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('met à jour le statut et injecte l’identifiant du chemin', async () => {
    const wish = { id: 7, nom: 'Selle', prix: '200', destinataire: 'Pour moi', acquis: true };
    backendApiClient.mockResolvedValue(wish);
    const body = { nom: 'Selle', prix: '200', acquis: true };
    expect((await PUT(request('PUT', body), context)).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/wishes/7', 'PUT', { id: 7, ...body });
  });

  it('supprime le souhait sans corps arbitraire', async () => {
    backendApiClient.mockResolvedValue({ message: 'Suppression réussie' });
    expect((await DELETE(request('DELETE'), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/wishes/7', 'DELETE');
  });
});
