import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { animalHistoryMutationSchema, animalSchema, positiveIdSchema } from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string }> };

async function mutate(request: Request, context: RouteContext, method: 'POST' | 'PUT') {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    const body = await parseJson(request, animalHistoryMutationSchema);
    const result = await backendApiClient(`api/v1/animals/${id}/history`, method, { ...body, idAnimal: id });
    return bffSuccess(animalSchema.parse(result));
  } catch (error) {
    return bffError(error);
  }
}

export const POST = (request: Request, context: RouteContext) => mutate(request, context, 'POST');
export const PUT = (request: Request, context: RouteContext) => mutate(request, context, 'PUT');
