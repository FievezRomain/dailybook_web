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
    expect((await GET(new Request('http://localhost/api/events'))).status).toBe(200);
    backendApiClient.mockResolvedValueOnce({ rows: [event] });
    expect((await GET(new Request('http://localhost/api/events'))).status).toBe(422);
  });
  it('normalise une note backend a 0 comme une note absente', async () => {
    backendApiClient.mockResolvedValueOnce([
      ...Array.from({ length: 18 }, (_, index) => ({ ...event, id: index + 1 })),
      { ...event, id: 19, note: 0 },
    ]);

    const response = await GET(new Request('http://localhost/api/events'));
    const events = await response.json();

    expect(response.status).toBe(200);
    expect(events).toHaveLength(19);
    expect(events[18]).not.toHaveProperty('note');
  });
  it('valide et transmet les filtres de lecture au backend', async () => {
    backendApiClient.mockResolvedValueOnce([event]);
    const response = await GET(new Request(
      'http://localhost/api/events?date_from=2026-09-01&date_to=2026-09-30&animal_ids=2&event_types=soins&include_overdue_open=true&limit=100',
    ));

    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith(
      'api/v1/events?date_from=2026-09-01&date_to=2026-09-30&animal_ids=2&event_types=soins&include_overdue_open=true&limit=100',
    );
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
