import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherCard } from './WeatherCard';

const mocks = vi.hoisted(() => ({ query: vi.fn(), geolocation: vi.fn() }));
vi.mock('../hooks/use-weather', () => ({ useWeatherQuery: mocks.query }));

const data = {
  current: { observedAt: '2026-08-25T12:00:00Z', symbolCode: 'partlycloudy_day', temperature: 22, humidity: 61, windSpeed: 4.2, precipitationNextHour: 0 },
  days: [{ date: '2026-08-25', symbolCode: 'partlycloudy_day', temperatureMin: 14, temperatureMax: 23, precipitation: 0.4, windSpeedMax: 7 }],
  attribution: { label: 'Données MET Norway', url: 'https://api.met.no/' },
};

describe('WeatherCard', () => {
  beforeEach(() => {
    mocks.query.mockReturnValue({ data, isPending: false, isError: false, refetch: vi.fn() });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: mocks.geolocation } });
  });

  it('ne demande la position qu’après un consentement explicite puis affiche des valeurs textuelles', () => {
    mocks.geolocation.mockImplementation((success: PositionCallback) => success({ coords: { latitude: 48.8566, longitude: 2.3522 } } as GeolocationPosition));
    render(<WeatherCard />);
    expect(mocks.geolocation).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Utiliser ma position/ }));
    expect(mocks.geolocation).toHaveBeenCalledOnce();
    expect(screen.getByText('22 °C')).toBeVisible();
    expect(screen.getByText('61 %')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Données MET Norway' })).toHaveAttribute('href', 'https://api.met.no/');
  });

  it('explique un refus et permet de réessayer', () => {
    mocks.geolocation.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => error({ code: 1, PERMISSION_DENIED: 1 } as GeolocationPositionError));
    render(<WeatherCard />);
    fireEvent.click(screen.getByRole('button', { name: /Utiliser ma position/ }));
    expect(screen.getByText('Géolocalisation refusée')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeEnabled();
  });
});
