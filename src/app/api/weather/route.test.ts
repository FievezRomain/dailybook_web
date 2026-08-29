import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), forecast: vi.fn() }));
vi.mock('@/lib/auth/server/getCurrentUser', () => ({ getCurrentUser: mocks.currentUser }));
vi.mock('@/features/weather/server/weather-provider', () => ({ getWeatherForecast: mocks.forecast }));

const forecast = {
  current: { observedAt: '2026-08-25T12:00:00Z', symbolCode: 'partlycloudy_day', temperature: 22, humidity: 61, windSpeed: 4.2, precipitationNextHour: 0 },
  days: [{ date: '2026-08-25', symbolCode: 'partlycloudy_day', temperatureMin: 14, temperatureMax: 23, precipitation: 0.4, windSpeedMax: 7 }],
  attribution: { label: 'Données MET Norway' as const, url: 'https://api.met.no/' as const },
};

describe('/api/weather', () => {
  beforeEach(() => { mocks.currentUser.mockReset().mockResolvedValue({ uid: 'user-weather' }); mocks.forecast.mockReset().mockResolvedValue(forecast); });

  it('valide puis transmet la position et le fuseau au fournisseur serveur', async () => {
    const response = await GET(new Request('http://localhost/api/weather?latitude=48.8566&longitude=2.3522&timezone=Europe%2FParis'));
    expect(response.status).toBe(200);
    expect(mocks.forecast).toHaveBeenCalledWith({ latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' });
    expect(await response.json()).toEqual(forecast);
  });

  it('refuse les coordonnées ou fuseaux invalides avant tout appel externe', async () => {
    const response = await GET(new Request('http://localhost/api/weather?latitude=148&longitude=2&timezone=bad%20zone'));
    expect(response.status).toBe(422);
    expect(mocks.forecast).not.toHaveBeenCalled();
  });

  it('reste privé même si le fournisseur ne nécessite pas de clé', async () => {
    mocks.currentUser.mockResolvedValue(null);
    const response = await GET(new Request('http://localhost/api/weather?latitude=48&longitude=2&timezone=Europe%2FParis'));
    expect(response.status).toBe(401);
    expect(mocks.forecast).not.toHaveBeenCalled();
  });
});
