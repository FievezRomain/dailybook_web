import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const filename = `${'a'.repeat(32)}.jpg`;
const picture = { id: 8, filename, date_enregistrement: '2026-08-24', idanimal: 4 };
const context = { params: Promise.resolve({ id: '4' }) };

function postRequest(body: unknown) {
  return new Request('http://localhost/api/animals/4/body-pictures', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/animals/[id]/body-pictures', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lit la liste REST sans rows', async () => {
    backendApiClient.mockResolvedValue([picture]);
    await expect((await GET(new Request('http://localhost'), context)).json()).resolves.toEqual([picture]);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/body-pictures');
  });

  it('lie la photo validée à l’animal du chemin', async () => {
    backendApiClient.mockResolvedValue(picture);
    const response = await POST(postRequest({ filename, date_enregistrement: '2026-06-01' }), context);
    expect(response.status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/body-pictures', 'POST', {
      filename, date_enregistrement: '2026-06-01', idanimal: 4,
    });
  });

  it('refuse un nom non généré par le service de fichiers', async () => {
    expect((await POST(postRequest({ filename: 'photo.jpg' }), context)).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
