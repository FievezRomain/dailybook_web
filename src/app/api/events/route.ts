import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createEventSchema, eventListSchema } from '@/features/events/schemas/event';

export async function GET() {
  try {
    return bffSuccess(eventListSchema.parse(await backendApiClient('api/v1/events')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createEventSchema);
    return bffSuccess(eventListSchema.parse(await backendApiClient('api/v1/events', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
