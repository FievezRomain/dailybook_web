import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { POST } from './route';
import { DELETE, PUT } from './[item]/[historyId]/route';

const animal = { id: 4, nom: 'Nala', provenance: 'owner', image: null };
const headers = {
  'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't',
};

function request(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
  return new Request(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

describe('mutations d’historique animal', () => {
  beforeEach(() => {
    backendApiClient.mockReset();
    backendApiClient.mockResolvedValue(animal);
  });

  it('crée une mesure datée en liant l’animal du chemin', async () => {
    const response = await POST(request('http://localhost/api/animals/4/history', 'POST', {
      item: 'poids', value: 12.5, unity: 'kg', datemodification: '2026-08-20',
    }), { params: Promise.resolve({ id: '4' }) });
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/history', 'POST', {
      item: 'poids', value: 12.5, unity: 'kg', datemodification: '2026-08-20', idAnimal: 4,
    });
  });

  it('impose le type et les identifiants du chemin pendant la modification', async () => {
    const response = await PUT(request('http://localhost/api/animals/4/history/taille/9', 'PUT', {
      item: 'poids', value: 80, datemodification: '2026-08-21',
    }), { params: Promise.resolve({ id: '4', item: 'taille', historyId: '9' }) });
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/history/taille/9', 'PUT', {
      item: 'taille', value: 80, datemodification: '2026-08-21', idAnimal: 4,
    });
  });

  it('confie la suppression propriétaire au backend et exige le CSRF', async () => {
    const context = { params: Promise.resolve({ id: '4', item: 'poids', historyId: '9' }) };
    expect((await DELETE(request('http://localhost/api/animals/4/history/poids/9', 'DELETE'), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/history/poids/9', 'DELETE');

    backendApiClient.mockClear();
    const unsafe = new Request('http://localhost/api/animals/4/history/poids/9', { method: 'DELETE' });
    expect((await DELETE(unsafe, context)).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
