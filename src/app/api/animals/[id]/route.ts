import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import { animalSchema, positiveIdSchema, updateAnimalSchema } from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    const body = await parseJson(request, updateAnimalSchema);
    return bffSuccess(animalSchema.parse(await backendApiClient(`api/v1/animals/${id}`, 'PUT', { ...body, id })));
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    await backendApiClient(`api/v1/animals/${id}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
