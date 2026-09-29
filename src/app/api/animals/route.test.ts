import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const animal = {
  id: 3, nom: 'Milo', espece: 'Chat', datenaissance: '2020-05-12', provenance: 'owner',
  email: 'alice@example.com', couleur: 'Tigré', image: null,
};

function mutationRequest(body: unknown) {
  return new Request('http://localhost/api/animals', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/animals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide la liste FastAPI sans enveloppe legacy rows', async () => {
    backendApiClient.mockResolvedValue([animal]);
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([animal]);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals');
  });

  it('rejette une ancienne réponse rows', async () => {
    backendApiClient.mockResolvedValue({ rows: [animal] });
    expect((await GET()).status).toBe(422);
  });

  it('valide et crée un animal avec le champ couleur', async () => {
    backendApiClient.mockResolvedValue(animal);
    const response = await POST(mutationRequest({ nom: 'Milo', espece: 'Chat', couleur: 'Tigré' }));
    expect(response.status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals', 'POST', {
      nom: 'Milo', espece: 'Chat', couleur: 'Tigré',
    });
  });

  it('refuse les champs legacy ou inattendus', async () => {
    expect((await POST(mutationRequest({ nom: 'Milo', robe: 'Tigré' }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
