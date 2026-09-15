import type { z } from 'zod';
import type { weatherForecastSchema, weatherLocationSchema, weatherQuerySchema } from '../schemas/weather';

export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
export type WeatherForecast = z.infer<typeof weatherForecastSchema>;
export type WeatherLocation = z.infer<typeof weatherLocationSchema>;
