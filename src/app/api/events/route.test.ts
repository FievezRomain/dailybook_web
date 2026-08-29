import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const event = {
  id: 4, nom: 'Vaccin', dateevent: '2026-09-01', animaux: [2], eventtype: 'soins', state: 'À faire',
  documents: [], shared_groups: [], todisplay: true,
};
function request(body: unknown) {
  return new Request('http://localhost/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/events', () => {
  beforeEach(() => vi.clearAllMocks());
  it('lit la liste REST et refuse l’enveloppe rows', async () => {
    backendApiClient.mockResolvedValueOnce([event]);
    expect((await GET()).status).toBe(200);
    backendApiClient.mockResolvedValueOnce({ rows: [event] });
    expect((await GET()).status).toBe(422);
  });
  it('valide la création', async () => {
    backendApiClient.mockResolvedValue([event]);
    const response = await POST(request({
      nom: 'Vaccin', dateevent: '2026-09-01', animaux: [2], eventtype: 'soins', state: 'À faire',
    }));
    expect(response.status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/events', 'POST', expect.objectContaining({
      nom: 'Vaccin', animaux: [2], documents: [], shared_groups: [],
    }));
  });
  it('refuse une création sans animal', async () => {
    expect((await POST(request({ nom: 'Vaccin', dateevent: '2026-09-01', animaux: [], eventtype: 'soins' }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
