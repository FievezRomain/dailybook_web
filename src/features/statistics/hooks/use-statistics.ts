'use client';

import { useQuery } from '@tanstack/react-query';
import { getStatistics } from '../api/statistics-api';
import type { StatisticsQueryInput, StatisticsResponseMap, StatisticsType } from '../types/statistics';

export const statisticsQueryKey = <T extends StatisticsType>(type: T, input: StatisticsQueryInput) =>
  ['statistics', type, { ...input, animaux: [...input.animaux].sort((left, right) => left - right) }] as const;

export function useStatisticsQuery<T extends StatisticsType>(
  type: T,
  input: StatisticsQueryInput,
  enabled = true,
) {
  return useQuery<StatisticsResponseMap[T]>({
    queryKey: statisticsQueryKey(type, input),
    queryFn: () => getStatistics(type, input),
    enabled: enabled && input.animaux.length > 0,
    staleTime: 10 * 60_000,
  });
}
