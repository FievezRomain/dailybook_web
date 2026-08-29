import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const objective = {
  id: 3,
  title: 'Progresser',
  temporalityobjectif: null,
  datedebut: '2026-01-01',
  datefin: '2026-06-30',
  animaux: [2],
  sousetapes: [{ id: 9, etape: 'Première étape', state: false, order: 1 }],
};

function postRequest(body: unknown) {
  return new Request('http://localhost/api/objectifs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/objectifs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lit une liste REST sans accepter d’enveloppe legacy', async () => {
    backendApiClient.mockResolvedValueOnce([objective]);
    expect((await GET()).status).toBe(200);
    backendApiClient.mockResolvedValueOnce({ rows: [objective] });
    expect((await GET()).status).toBe(422);
  });

  it('crée un objectif avec au moins une sous-étape utile', async () => {
    backendApiClient.mockResolvedValue(objective);
    const body = {
      title: 'Progresser', animaux: [2], datedebut: '2026-01-01', datefin: '2026-06-30',
      sousetapes: [{ etape: 'Première étape', state: false, order: 1 }],
    };
    const response = await POST(postRequest(body));

    expect(response.status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/objectifs', 'POST', body);
  });

  it('refuse une liste de sous-étapes vide ou une plage de dates inversée', async () => {
    expect((await POST(postRequest({ title: 'Vide', sousetapes: [] }))).status).toBe(422);
    expect((await POST(postRequest({
      title: 'Dates', datedebut: '2026-06-30', datefin: '2026-01-01', sousetapes: [{ etape: 'Étape' }],
    }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
