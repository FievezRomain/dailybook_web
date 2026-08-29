import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { POST as invite } from './[id]/invitations/route';
import { POST as propose } from './[id]/animals/route';
import { DELETE as removeMember } from './[id]/members/route';
import { PATCH as respondShare } from '../animal-shares/[id]/route';

const context = { params: Promise.resolve({ id: '7' }) };
const group = {
  id: 7, name: 'Vasco', informations: null, nb_members: 1, nb_animaux: 0,
  data: {
    animals: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
    members: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
  },
};

function request(method: string, body: unknown) {
  return new Request('http://localhost/api/groups/7', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('mutations imbriquées des groupes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    backendApiClient.mockResolvedValue(group);
  });

  it('injecte le groupe du chemin lors de l’invitation', async () => {
    const body = { members: ['membre@example.com'] };
    expect((await invite(request('POST', body), context)).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/groups/7/invitations', 'POST', body);
  });

  it('permet à un membre gratuit de proposer ses animaux', async () => {
    const body = { animals: [12] };
    expect((await propose(request('POST', body), context)).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/groups/7/animals', 'POST', body);
  });

  it('transmet la décision Premium sur un partage animal', async () => {
    const body = { status: 'accepted', animaux: [12] };
    expect((await respondShare(request('PATCH', body), context)).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animal-shares/7', 'PATCH', body);
  });

  it('autorise le départ ou le retrait explicite d’un membre', async () => {
    backendApiClient.mockResolvedValue({ message: 'Suppression réussie' });
    const body = { email: 'membre@example.com' };
    const response = await removeMember(request('DELETE', body), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/groups/7/members', 'DELETE', body);
  });
});
