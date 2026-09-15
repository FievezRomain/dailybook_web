import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeatherForecast, searchWeatherLocations } from './weather-provider';

const entry = (time: string, temperature: number, symbol = 'partlycloudy_day', precipitation = 0.2) => ({
  time,
  data: {
    instant: { details: { air_temperature: temperature, relative_humidity: 65, wind_speed: 4.4 } },
    next_1_hours: { summary: { symbol_code: symbol }, details: { precipitation_amount: precipitation } },
  },
});

describe('MET Norway weather provider', () => {
  beforeEach(() => { process.env.WEATHER_USER_AGENT = 'VascoWeb/1.0 https://vasco.example/contact'; });
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.WEATHER_USER_AGENT; });

  it('arrondit la position, identifie Vasco et normalise les prévisions', async () => {
    const fetchMock = vi.fn().mockImplementation((input: URL) => String(input).includes('nominatim')
      ? Promise.resolve(new Response(JSON.stringify({ features: [{ properties: { geocoding: { name: 'Paris', city: 'Métropole du Grand Paris', country: 'France' } } }] }), { status: 200 }))
      : Promise.resolve(new Response(JSON.stringify({ properties: { timeseries: [
        entry('2026-08-25T10:00:00Z', 18), entry('2026-08-25T12:00:00Z', 22), entry('2026-08-26T12:00:00Z', 20, 'rain', 1.5),
      ] } }), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);
    const result = await getWeatherForecast({ latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' });

    expect(String(fetchMock.mock.calls[0][0])).toContain('lat=48.86&lon=2.35');
    expect(fetchMock.mock.calls[0][1].headers['User-Agent']).toContain('VascoWeb');
    expect(fetchMock.mock.calls[0][1].next).toEqual({ revalidate: 15 * 60 });
    expect(String(fetchMock.mock.calls[1][0])).toContain('format=geocodejson&lat=48.86&lon=2.35&zoom=10');
    expect(fetchMock.mock.calls[1][1].next).toEqual({ revalidate: 24 * 60 * 60 });
    expect(result.current).toMatchObject({ temperature: 18, humidity: 65, precipitationNextHour: 0.2 });
    expect(result.location?.label).toBe('Paris, France');
    expect(result.days).toHaveLength(2);
    expect(result.days[0]).toMatchObject({ temperatureMin: 18, temperatureMax: 22, precipitation: 0.4 });
  });

  it('utilise une identification Vasco sûre lorsque la variable serveur manque', async () => {
    delete process.env.WEATHER_USER_AGENT;
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ properties: { timeseries: [
      entry('2026-08-25T10:00:00Z', 18),
    ] } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await getWeatherForecast({ latitude: 48, longitude: 2, timezone: 'Europe/Paris' });

    expect(fetchMock.mock.calls[0][1].headers['User-Agent']).toContain('github.com/FievezRomain/dailybook_web');
  });

  it('conserve les prévisions si le libellé de localisation est indisponible', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ properties: { timeseries: [entry('2026-08-25T10:00:00Z', 18)] } }), { status: 200 }))
      .mockRejectedValueOnce(new Error('geocoding unavailable'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeatherForecast({ latitude: 48, longitude: 2, timezone: 'Europe/Paris' });

    expect(result.location).toBeNull();
    expect(result.current.temperature).toBe(18);
  });

  it('recherche une ville sans exposer directement Nominatim au navigateur', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ features: [{
      properties: { geocoding: { label: 'Vernais, Cher, France' } },
      geometry: { type: 'Point', coordinates: [2.7129437, 46.7655596] },
    }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchWeatherLocations('Vernais');

    expect(String(fetchMock.mock.calls[0][0])).toContain('/search?format=geocodejson&q=Vernais&limit=5');
    expect(result).toEqual([{ label: 'Vernais, Cher, France', latitude: 46.7655596, longitude: 2.7129437 }]);
  });

  it('refuse une identification serveur invalide', async () => {
    process.env.WEATHER_USER_AGENT = 'Vasco\nInvalid';
    await expect(getWeatherForecast({ latitude: 48, longitude: 2, timezone: 'Europe/Paris' })).rejects.toMatchObject({ code: 'WEATHER_NOT_CONFIGURED', status: 503 });
  });

  it('refuse une réponse fournisseur divergente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ properties: { timeseries: [] } }), { status: 200 })));
    await expect(getWeatherForecast({ latitude: 48, longitude: 2, timezone: 'Europe/Paris' })).rejects.toMatchObject({ code: 'WEATHER_PROVIDER_INVALID', status: 502 });
  });

  it('normalise une panne réseau sans exposer le fournisseur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('provider details')));
    await expect(getWeatherForecast({ latitude: 48, longitude: 2, timezone: 'Europe/Paris' })).rejects.toMatchObject({ code: 'WEATHER_UNAVAILABLE', status: 503, message: 'La météo est temporairement indisponible.' });
  });
});
