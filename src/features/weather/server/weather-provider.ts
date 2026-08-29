import 'server-only';

import type { z } from 'zod';
import { WebApiError } from '@/shared/api/api-error';
import { metNorwayForecastSchema, weatherForecastSchema } from '../schemas/weather';
import type { WeatherForecast, WeatherQuery } from '../types/weather';

const PROVIDER_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

export async function getWeatherForecast(query: WeatherQuery): Promise<WeatherForecast> {
  const userAgent = process.env.WEATHER_USER_AGENT?.trim();
  if (!userAgent || userAgent.length > 255 || /[\r\n]/.test(userAgent)) {
    throw new WebApiError({ code: 'WEATHER_NOT_CONFIGURED', message: 'Le service météo n’est pas encore configuré.', status: 503 });
  }
  const latitude = roundCoordinate(query.latitude);
  const longitude = roundCoordinate(query.longitude);
  const url = new URL(PROVIDER_URL);
  url.search = new URLSearchParams({ lat: latitude.toFixed(2), lon: longitude.toFixed(2) }).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': userAgent },
      signal: AbortSignal.timeout(5_000),
      next: { revalidate: 15 * 60 },
    });
  } catch {
    throw new WebApiError({ code: 'WEATHER_UNAVAILABLE', message: 'La météo est temporairement indisponible.', status: 503 });
  }
  if (response.status === 203) console.warn('MET Norway Locationforecast indique une version dépréciée.');
  if (!response.ok && response.status !== 203) {
    throw new WebApiError({ code: 'WEATHER_PROVIDER_ERROR', message: 'La météo est temporairement indisponible.', status: 502 });
  }

  let raw: unknown;
  try { raw = await response.json(); }
  catch { throw new WebApiError({ code: 'WEATHER_PROVIDER_INVALID', message: 'La réponse météo est invalide.', status: 502 }); }
  const parsed = metNorwayForecastSchema.safeParse(raw);
  if (!parsed.success) throw new WebApiError({ code: 'WEATHER_PROVIDER_INVALID', message: 'La réponse météo est invalide.', status: 502 });
  return weatherForecastSchema.parse(toWeatherForecast(parsed.data.properties.timeseries, query.timezone));
}

function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

type TimeSeries = z.infer<typeof metNorwayForecastSchema>['properties']['timeseries'];

function toWeatherForecast(timeseries: TimeSeries, timezone: string): WeatherForecast {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const byDate = new Map<string, TimeSeries>();
  for (const entry of timeseries) {
    const date = formatter.format(new Date(entry.time));
    const entries = byDate.get(date) ?? [];
    entries.push(entry);
    byDate.set(date, entries);
  }
  const current = timeseries[0];
  const currentPeriod = current.data.next_1_hours ?? current.data.next_6_hours;
  if (!currentPeriod) throw new WebApiError({ code: 'WEATHER_PROVIDER_INVALID', message: 'La réponse météo est incomplète.', status: 502 });
  const days = [...byDate.entries()].slice(0, 3).map(([date, entries]) => {
    const temperatures = entries.map((entry) => entry.data.instant.details.air_temperature);
    const midday = entries.find((entry) => new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', hourCycle: 'h23' }).format(new Date(entry.time)) === '12') ?? entries[0];
    const middayPeriod = midday.data.next_1_hours ?? midday.data.next_6_hours ?? currentPeriod;
    return {
      date,
      symbolCode: middayPeriod.summary.symbol_code,
      temperatureMin: Math.round(Math.min(...temperatures)),
      temperatureMax: Math.round(Math.max(...temperatures)),
      precipitation: roundOne(entries.reduce((total, entry) => total + (entry.data.next_1_hours?.details.precipitation_amount ?? 0), 0)),
      windSpeedMax: roundOne(Math.max(...entries.map((entry) => entry.data.instant.details.wind_speed))),
    };
  });
  return {
    current: {
      observedAt: current.time,
      symbolCode: currentPeriod.summary.symbol_code,
      temperature: roundOne(current.data.instant.details.air_temperature),
      humidity: Math.round(current.data.instant.details.relative_humidity),
      windSpeed: roundOne(current.data.instant.details.wind_speed),
      precipitationNextHour: roundOne(current.data.next_1_hours?.details.precipitation_amount ?? 0),
    },
    days,
    attribution: { label: 'Données MET Norway', url: 'https://api.met.no/' },
  };
}

function roundOne(value: number) { return Math.round(value * 10) / 10; }
