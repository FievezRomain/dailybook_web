import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PATCH, PUT } from './route';

const events = [{
  id: 4, nom: 'Vaccin', dateevent: '2026-09-01', animaux: [2], eventtype: 'soins', state: 'Terminé',
  documents: [], shared_groups: [], todisplay: true,
}];
const context = { params: Promise.resolve({ id: '4' }) };
function request(method: string, url: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/events/[id]', () => {
  beforeEach(() => vi.clearAllMocks());
  it('utilise PATCH pour un changement d’état borné', async () => {
    backendApiClient.mockResolvedValue(events);
    const response = await PATCH(request('PATCH', 'http://localhost/api/events/4', { state: 'Terminé' }), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/events/4', 'PATCH', { id: 4, state: 'Terminé' });
  });
  it('exige un scope de récurrence valide pour la suppression', async () => {
    backendApiClient.mockResolvedValue(events);
    const response = await DELETE(request('DELETE', 'http://localhost/api/events/4?scope=series'), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/events/4?scope=series', 'DELETE');
    expect((await DELETE(request('DELETE', 'http://localhost/api/events/4?scope=all'), context)).status).toBe(422);
  });
  it('transmet explicitement la portée de modification', async () => {
    backendApiClient.mockResolvedValue(events);
    const body = {
      nom: 'Vaccin', dateevent: '2026-09-01', animaux: [2], eventtype: 'soins', state: 'Terminé',
      documents: [], shared_groups: [8], update_scope: 'following',
    };
    const response = await PUT(request('PUT', 'http://localhost/api/events/4', body), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/events/4', 'PUT', { ...body, id: 4 });
  });
});
