import { webApiClient } from '@/shared/api/web-api-client';
import { statisticsResponseSchemas } from '../schemas/statistics';
import type { StatisticsQueryInput, StatisticsResponseMap, StatisticsType } from '../types/statistics';

export async function getStatistics<T extends StatisticsType>(
  type: T,
  input: StatisticsQueryInput,
): Promise<StatisticsResponseMap[T]> {
  const response = await webApiClient.post(`/statistics/${type}`, input);
  return statisticsResponseSchemas[type].parse(response.data) as StatisticsResponseMap[T];
}
