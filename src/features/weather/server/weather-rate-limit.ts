import 'server-only';

import { WebApiError } from '@/shared/api/api-error';

const WINDOW_MS = 15 * 60_000;
const MAX_REQUESTS = 20;
const requestsByUser = new Map<string, number[]>();

export function checkWeatherRateLimit(userId: string, now = Date.now()) {
  const recent = (requestsByUser.get(userId) ?? []).filter((timestamp) => timestamp > now - WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    throw new WebApiError({ code: 'WEATHER_RATE_LIMITED', message: 'Trop de demandes météo. Réessayez dans quelques minutes.', status: 429 });
  }
  recent.push(now);
  requestsByUser.set(userId, recent);
  if (requestsByUser.size > 5_000) {
    for (const [id, timestamps] of requestsByUser) if (!timestamps.some((timestamp) => timestamp > now - WINDOW_MS)) requestsByUser.delete(id);
  }
}
