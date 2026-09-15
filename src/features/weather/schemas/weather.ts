import { z } from 'zod';

const finiteCoordinate = z.coerce.number().finite();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const weatherQuerySchema = z.object({
  latitude: finiteCoordinate.min(-90).max(90),
  longitude: finiteCoordinate.min(-180).max(180),
  timezone: z.string().trim().min(1).max(100).regex(/^[A-Za-z_+-]+(?:\/[A-Za-z0-9_+.-]+)*$/),
}).strict().superRefine((value, context) => {
  try { new Intl.DateTimeFormat('fr-FR', { timeZone: value.timezone }); }
  catch { context.addIssue({ code: 'custom', path: ['timezone'], message: 'Le fuseau horaire est invalide.' }); }
});

export const weatherLocationSearchQuerySchema = z.object({
  query: z.string().trim().min(2).max(120),
}).strict();

export const weatherLocationSchema = z.object({
  label: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).strict();

export const weatherLocationListSchema = z.array(weatherLocationSchema).max(5);

export const weatherForecastSchema = z.object({
  location: z.object({
    label: z.string().trim().min(1).max(200),
    attribution: z.object({
      label: z.literal('© OpenStreetMap contributors'),
      url: z.literal('https://www.openstreetmap.org/copyright'),
    }),
  }).nullable(),
  current: z.object({
    observedAt: z.string().datetime({ offset: true }),
    symbolCode: z.string().min(1).max(100),
    temperature: z.number(),
    humidity: z.number().min(0).max(100),
    windSpeed: z.number().nonnegative(),
    precipitationNextHour: z.number().nonnegative(),
  }),
  days: z.array(z.object({
    date: isoDate,
    symbolCode: z.string().min(1).max(100),
    temperatureMin: z.number(),
    temperatureMax: z.number(),
    precipitation: z.number().nonnegative(),
    windSpeedMax: z.number().nonnegative(),
  })).min(1).max(3),
  attribution: z.object({ label: z.literal('Données MET Norway'), url: z.literal('https://api.met.no/') }),
}).strict();

export const nominatimReverseSchema = z.object({
  features: z.array(z.object({
    properties: z.object({
      geocoding: z.object({
        name: z.string().trim().min(1).optional(),
        city: z.string().trim().min(1).optional(),
        district: z.string().trim().min(1).optional(),
        county: z.string().trim().min(1).optional(),
        state: z.string().trim().min(1).optional(),
        country: z.string().trim().min(1).optional(),
        label: z.string().trim().min(1).optional(),
      }).passthrough(),
    }).passthrough(),
  }).passthrough()).max(1),
}).passthrough();

export const nominatimSearchSchema = z.object({
  features: z.array(z.object({
    properties: z.object({
      geocoding: z.object({
        label: z.string().trim().min(1),
      }).passthrough(),
    }).passthrough(),
    geometry: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([z.number(), z.number()]),
    }).passthrough(),
  }).passthrough()).max(5),
}).passthrough();

const providerDetailsSchema = z.object({
  air_temperature: z.number(),
  relative_humidity: z.number().min(0).max(100),
  wind_speed: z.number().nonnegative(),
}).passthrough();

const providerPeriodSchema = z.object({
  summary: z.object({ symbol_code: z.string().min(1) }),
  details: z.object({ precipitation_amount: z.number().nonnegative().optional() }).passthrough(),
});

export const metNorwayForecastSchema = z.object({
  properties: z.object({
    timeseries: z.array(z.object({
      time: z.string().datetime({ offset: true }),
      data: z.object({
        instant: z.object({ details: providerDetailsSchema }),
        next_1_hours: providerPeriodSchema.optional(),
        next_6_hours: providerPeriodSchema.optional(),
      }),
    })).min(1),
  }),
});
