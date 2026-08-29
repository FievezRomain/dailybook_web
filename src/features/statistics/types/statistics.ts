import type { z } from 'zod';
import type {
  eventStatisticsSchema,
  physicalStatisticsSchema,
  statisticHistoryEntrySchema,
  statisticsChartSchema,
  statisticsQuerySchema,
  statisticsTypeSchema,
} from '../schemas/statistics';

export type StatisticsType = z.infer<typeof statisticsTypeSchema>;
export type StatisticsQueryInput = z.input<typeof statisticsQuerySchema>;
export type EventStatistics = z.infer<typeof eventStatisticsSchema>;
export type PhysicalStatistics = z.infer<typeof physicalStatisticsSchema>;
export type StatisticsChart = z.infer<typeof statisticsChartSchema>;
export type StatisticHistoryEntry = z.infer<typeof statisticHistoryEntrySchema>;

export type StatisticsResponseMap = {
  depenses: EventStatistics;
  entrainements: EventStatistics;
  balades: EventStatistics;
  poids: PhysicalStatistics;
  tailles: PhysicalStatistics;
  alimentations: PhysicalStatistics;
  concours: EventStatistics;
};
