import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const group = {
  id: 1,
  name: 'Écurie Vasco',
  informations: null,
  created_at: '2026-08-24T10:00:00+00:00',
  nb_members: 1,
  nb_animaux: 0,
  data: {
    animals: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
    members: [
      { type: 'pending', items: [] },
      { type: 'accepted', items: [{ user_id: 2, email: 'manager@example.com', prenom: 'Alix', role: 'manager' }] },
    ],
  },
};

function mutation(body: unknown, csrf = true) {
  return new Request('http://localhost/api/groups', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      ...(csrf ? { cookie: 'vasco-csrf=t', 'x-csrf-token': 't' } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('/api/groups', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lit exclusivement la liste REST courante', async () => {
    backendApiClient.mockResolvedValue([group]);
    expect((await GET()).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/groups');
  });

  it('valide puis crée un groupe Premium', async () => {
    backendApiClient.mockResolvedValue(group);
    const body = { name: 'Écurie Vasco', informations: null };
    expect((await POST(mutation(body))).status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/groups', 'POST', body);
  });

  it('refuse un nom vide et une mutation sans CSRF', async () => {
    expect((await POST(mutation({ name: '' }))).status).toBe(422);
    expect((await POST(mutation({ name: 'Vasco' }, false))).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
