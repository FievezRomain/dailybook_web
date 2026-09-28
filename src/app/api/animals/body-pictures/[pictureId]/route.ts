import { backendApiClient } from '@/shared/api/backend-api-client';
import { validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent } from '@/shared/api/bff-response';
import { positiveIdSchema } from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ pictureId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const pictureId = positiveIdSchema.parse((await context.params).pictureId);
    await backendApiClient(`api/v1/animals/body-pictures/${pictureId}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
