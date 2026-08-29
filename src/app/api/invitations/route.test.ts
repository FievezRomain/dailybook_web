import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET } from './route';
import { PATCH } from './[id]/route';

const invitation = {
  id: 3,
  group_id: 7,
  email: 'membre@example.com',
  proposed_by: 2,
  status: 'pending',
  group_name: 'Vasco',
  proposed_by_name: 'Alix',
};

function request(body: unknown) {
  return new Request('http://localhost/api/invitations/3', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/invitations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide les invitations en attente', async () => {
    backendApiClient.mockResolvedValue([invitation]);
    expect((await GET()).status).toBe(200);
  });

  it('normalise un refus sans groupe en null', async () => {
    backendApiClient.mockResolvedValue({});
    const body = { status: 'declined' };
    const response = await PATCH(request(body), { params: Promise.resolve({ id: '3' }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/invitations/3', 'PATCH', body);
  });

  it('refuse un statut inconnu', async () => {
    expect((await PATCH(request({ status: 'pending' }), { params: Promise.resolve({ id: '3' }) })).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
