import { backendApiClient } from '@/shared/api/backend-api-client';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { eventHighlightListSchema, highlightYearSchema } from '@/features/events/schemas/event';

export async function GET(request: Request) {
  try {
    const year = highlightYearSchema.parse(new URL(request.url).searchParams.get('year'));
    return bffSuccess(eventHighlightListSchema.parse(
      await backendApiClient(`api/v1/events/highlights?year=${year}`),
    ));
  } catch (error) {
    return bffError(error);
  }
}
