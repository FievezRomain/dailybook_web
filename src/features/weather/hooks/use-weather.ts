'use client';

import { useQuery } from '@tanstack/react-query';
import { getWeather } from '../api/weather-api';
import type { WeatherQuery } from '../types/weather';

export const weatherQueryKey = (query: WeatherQuery) => ['weather', query] as const;

export function useWeatherQuery(query: WeatherQuery | null) {
  return useQuery({
    queryKey: query ? weatherQueryKey(query) : ['weather', 'waiting-for-location'],
    queryFn: () => getWeather(query as WeatherQuery),
    enabled: query !== null,
    staleTime: 15 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
  });
}
