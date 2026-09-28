import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  eventIdSchema, eventListSchema, patchEventSchema, recurrenceScopeSchema, updateEventSchema,
} from '@/features/events/schemas/event';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = eventIdSchema.parse((await context.params).id);
    const body = await parseJson(request, updateEventSchema);
    return bffSuccess(eventListSchema.parse(await backendApiClient(`api/v1/events/${id}`, 'PUT', { ...body, id })));
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = eventIdSchema.parse((await context.params).id);
    const body = await parseJson(request, patchEventSchema);
    return bffSuccess(eventListSchema.parse(await backendApiClient(`api/v1/events/${id}`, 'PATCH', { ...body, id })));
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = eventIdSchema.parse((await context.params).id);
    const scope = recurrenceScopeSchema.parse(new URL(request.url).searchParams.get('scope') ?? 'occurrence');
    return bffSuccess(eventListSchema.parse(await backendApiClient(`api/v1/events/${id}?scope=${scope}`, 'DELETE')));
  } catch (error) {
    return bffError(error);
  }
}
