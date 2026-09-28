import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), search: vi.fn(), rateLimit: vi.fn() }));
vi.mock('@/lib/auth/server/getCurrentUser', () => ({ getCurrentUser: mocks.currentUser }));
vi.mock('@/features/weather/server/weather-provider', () => ({ searchWeatherLocations: mocks.search }));
vi.mock('@/features/weather/server/weather-rate-limit', () => ({ checkWeatherRateLimit: mocks.rateLimit }));

describe('/api/weather/locations', () => {
  beforeEach(() => {
    mocks.currentUser.mockReset().mockResolvedValue({ uid: 'user-weather' });
    mocks.search.mockReset().mockResolvedValue([{ label: 'Vernais, Cher, France', latitude: 46.7656, longitude: 2.7129 }]);
    mocks.rateLimit.mockReset();
  });

  it('recherche une ville côté serveur pour un utilisateur authentifié', async () => {
    const response = await GET(new Request('http://localhost/api/weather/locations?query=Vernais'));
    expect(response.status).toBe(200);
    expect(mocks.search).toHaveBeenCalledWith('Vernais');
    expect(await response.json()).toEqual([{ label: 'Vernais, Cher, France', latitude: 46.7656, longitude: 2.7129 }]);
  });

  it('refuse une recherche vide avant le fournisseur', async () => {
    const response = await GET(new Request('http://localhost/api/weather/locations?query='));
    expect(response.status).toBe(422);
    expect(mocks.search).not.toHaveBeenCalled();
  });
});
