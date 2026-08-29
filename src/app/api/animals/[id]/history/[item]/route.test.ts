import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET } from './route';

describe('GET /api/animals/[id]/history/[item]', () => {
  beforeEach(() => backendApiClient.mockReset());

  it('ajoute le type contractuel absent des lignes PostgreSQL', async () => {
    backendApiClient.mockResolvedValue([
      { id: 8, idanimal: 4, value: 12.5, unity: null, datemodification: '2026-08-20' },
    ]);

    const response = await GET(new Request('http://localhost/api/animals/4/history/poids'), {
      params: Promise.resolve({ id: '4', item: 'poids' }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      expect.objectContaining({ id: 8, idanimal: 4, item: 'poids', value: 12.5 }),
    ]);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/animals/4/history/poids');
  });

  it('refuse un historique non autorisé avant le backend', async () => {
    const response = await GET(new Request('http://localhost/api/animals/4/history/secret'), {
      params: Promise.resolve({ id: '4', item: 'secret' }),
    });
    expect(response.status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
