import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, PATCH } from './route';

const backendUser = {
  id: 12,
  email: 'alice@example.com',
  prenom: 'Alice',
  filename: null,
  expotoken: null,
  timezone: 'Europe/Paris',
  daily_reminder_enabled: false,
  subscription: 'Premium',
};

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/me', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      cookie: 'vasco-csrf=token',
      'x-csrf-token': 'token',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/me', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filtre et normalise le profil FastAPI', async () => {
    backendApiClient.mockResolvedValue({ ...backendUser, internal_field: 'secret' });
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 12,
      name: 'Alice',
      email: 'alice@example.com',
      picture: null,
      expotoken: null,
      timezone: 'Europe/Paris',
      dailyReminderEnabled: false,
      subscription: 'Premium',
    });
  });

  it('valide la mutation, met à jour puis relit la source de vérité', async () => {
    backendApiClient.mockResolvedValueOnce({ message: 'Profil mis à jour' })
      .mockResolvedValueOnce({ ...backendUser, prenom: 'Alicia' });

    const response = await PATCH(patchRequest({ prenom: 'Alicia' }));

    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenNthCalledWith(1, 'api/v1/users/me', 'PATCH', { prenom: 'Alicia' });
    expect(backendApiClient).toHaveBeenNthCalledWith(2, 'api/v1/users/me');
    await expect(response.json()).resolves.toMatchObject({ name: 'Alicia' });
  });

  it('refuse un payload vide ou inattendu', async () => {
    const emptyResponse = await PATCH(patchRequest({}));
    const unexpectedResponse = await PATCH(patchRequest({ role: 'admin' }));

    expect(emptyResponse.status).toBe(422);
    expect(unexpectedResponse.status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
