import { describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET } from './route';

describe('/api/events/highlights', () => {
  it('valide l’année et le contrat produit', async () => {
    backendApiClient.mockResolvedValue([{
      id: 'animal-birthday-2-2026', date: '2026-09-01', kind: 'animal_birthday', title: 'Anniversaire de Milo', animal_ids: [2],
    }]);
    const response = await GET(new Request('http://localhost/api/events/highlights?year=2026'));
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/events/highlights?year=2026');
    expect((await GET(new Request('http://localhost/api/events/highlights?year=1999'))).status).toBe(422);
  });
});
