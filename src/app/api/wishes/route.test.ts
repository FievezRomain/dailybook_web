import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const wish = { id: 7, nom: 'Selle', url: 'https://example.com/selle', prix: '200', destinataire: 'Pour moi', image: null, acquis: false };
function request(body: unknown) {
  return new Request('http://localhost/api/wishes', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/wishes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lit une liste REST et normalise un prix numérique en chaîne', async () => {
    backendApiClient.mockResolvedValue([{ ...wish, prix: 200 }]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: 7, nom: 'Selle', url: 'https://example.com/selle', prix: '200', destinataire: 'Pour moi', acquis: false }]);
  });

  it('crée un souhait avec une URL HTTP sûre', async () => {
    backendApiClient.mockResolvedValue(wish);
    const body = { nom: 'Selle', url: 'https://example.com/selle', prix: '200' };
    expect((await POST(request(body))).status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/wishes', 'POST', body);
  });

  it('refuse les protocoles actifs et les prix ambigus', async () => {
    expect((await POST(request({ nom: 'Selle', url: 'javascript:alert(1)' }))).status).toBe(422);
    expect((await POST(request({ nom: 'Selle', prix: '12 euros' }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
