import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PUT } from './route';

const context = { params: Promise.resolve({ id: '3' }) };
function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/objectifs/3', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/objectifs/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide et transmet une modification complète', async () => {
    const objective = {
      id: 3, title: 'Nouveau titre', animaux: [], sousetapes: [{ id: 9, etape: 'Étape', state: true, order: 1 }],
    };
    backendApiClient.mockResolvedValue(objective);
    const body = { ...objective };
    const response = await PUT(request('PUT', body), context);

    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/objectifs/3', 'PUT', body);
  });

  it('supprime par la route REST sans payload legacy', async () => {
    backendApiClient.mockResolvedValue({ message: 'Suppression réussie' });
    const response = await DELETE(request('DELETE'), context);
    expect(response.status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/objectifs/3', 'DELETE');
  });
});
