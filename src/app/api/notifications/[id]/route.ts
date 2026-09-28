import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent } from '@/shared/api/bff-response';
import { notificationIdSchema, setNotificationReadSchema } from '@/features/notifications/schemas/notification';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = notificationIdSchema.parse((await context.params).id);
    const body = await parseJson(request, setNotificationReadSchema);
    await backendApiClient(`api/v1/notifications/${id}`, 'PATCH', body);
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = notificationIdSchema.parse((await context.params).id);
    await backendApiClient(`api/v1/notifications/${id}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
