import { webApiClient } from '@/shared/api/web-api-client';
import { weatherForecastSchema } from '../schemas/weather';
import type { WeatherQuery } from '../types/weather';

export async function getWeather(query: WeatherQuery) {
  const parameters = new URLSearchParams({
    latitude: query.latitude.toFixed(2),
    longitude: query.longitude.toFixed(2),
    timezone: query.timezone,
  });
  return weatherForecastSchema.parse((await webApiClient.get(`/weather?${parameters}`)).data);
}
