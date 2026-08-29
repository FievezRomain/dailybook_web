import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PATCH } from './route';

const context = { params: Promise.resolve({ id: '4' }) };

function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/notifications/4', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/notifications/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backendApiClient.mockResolvedValue({ message: 'OK' });
  });

  it('modifie uniquement l’état de lecture de la notification du chemin', async () => {
    const body = { is_read: true };
    expect((await PATCH(request('PATCH', body), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notifications/4', 'PATCH', body);
  });

  it('refuse les champs arbitraires', async () => {
    expect((await PATCH(request('PATCH', { is_read: true, user_id: 9 }), context)).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('supprime la notification identifiée par le chemin', async () => {
    expect((await DELETE(request('DELETE'), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notifications/4', 'DELETE');
  });

  it('refuse un identifiant de chemin invalide', async () => {
    const invalidContext = { params: Promise.resolve({ id: '0' }) };
    expect((await DELETE(request('DELETE'), invalidContext)).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
