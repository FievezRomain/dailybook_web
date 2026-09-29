import { z } from 'zod';
import { eventSchema } from '@/features/events/schemas/event';

const positiveId = z.number().int().positive();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  },
  'La date est invalide.',
);

export const statisticsTypeSchema = z.enum([
  'depenses',
  'entrainements',
  'balades',
  'poids',
  'tailles',
  'alimentations',
  'concours',
]);

export const statisticsQuerySchema = z.object({
  animaux: z.array(positiveId).min(1).max(100),
  dateDebut: dateSchema,
  dateFin: dateSchema,
}).strict().refine((value) => value.dateDebut <= value.dateFin, {
  message: 'La date de début doit précéder la date de fin.',
  path: ['dateFin'],
});

export const eventStatisticItemSchema = z.object({
  value: z.number().nullable().optional(),
  exact_value: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  date: dateSchema.nullable().optional(),
  count: z.number().int().nonnegative().nullable().optional(),
  events: z.array(eventSchema).default([]),
});

export const eventStatisticsSchema = z.object({
  statistic: z.array(eventStatisticItemSchema),
});

export const statisticsChartSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string().optional(),
    data: z.array(z.number().nullable()),
    backgroundColor: z.string().optional(),
  })),
});

export const statisticHistoryEntrySchema = z.object({
  id: positiveId,
  idanimal: positiveId,
  date: dateSchema,
  value: z.union([z.number(), z.string()]),
  unity: z.string().nullable().optional(),
  type: z.enum(['quantity', 'food']).or(z.string().min(1)).optional(),
});

export const physicalStatisticsSchema = z.object({
  statistic: statisticsChartSchema,
  history: z.array(statisticHistoryEntrySchema),
});

export const statisticsResponseSchemas = {
  depenses: eventStatisticsSchema,
  entrainements: eventStatisticsSchema,
  balades: eventStatisticsSchema,
  poids: physicalStatisticsSchema,
  tailles: physicalStatisticsSchema,
  alimentations: physicalStatisticsSchema,
  concours: eventStatisticsSchema,
} as const;
