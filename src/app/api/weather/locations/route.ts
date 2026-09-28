import { getCurrentUser } from '@/lib/auth/server/getCurrentUser';
import { WebApiError } from '@/shared/api/api-error';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { weatherLocationSearchQuerySchema } from '@/features/weather/schemas/weather';
import { searchWeatherLocations } from '@/features/weather/server/weather-provider';
import { checkWeatherRateLimit } from '@/features/weather/server/weather-rate-limit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new WebApiError({ code: 'AUTH_REQUIRED', message: 'Une connexion est requise.', status: 401 });
    checkWeatherRateLimit(user.uid);
    const { query } = weatherLocationSearchQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return bffSuccess(await searchWeatherLocations(query));
  } catch (error) {
    return bffError(error);
  }
}
