import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import {
  animalHistoryItemSchema, animalHistoryMutationSchema, animalSchema, positiveIdSchema,
} from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string; item: string; historyId: string }> };

async function parseParams(context: RouteContext) {
  const params = await context.params;
  return {
    id: positiveIdSchema.parse(params.id),
    item: animalHistoryItemSchema.parse(params.item),
    historyId: positiveIdSchema.parse(params.historyId),
  };
}

export async function PUT(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const { id, item, historyId } = await parseParams(context);
    const body = await parseJson(request, animalHistoryMutationSchema);
    const result = await backendApiClient(`api/v1/animals/${id}/history/${item}/${historyId}`, 'PUT', {
      ...body, item, idAnimal: id,
    });
    return bffSuccess(animalSchema.parse(result));
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const { id, item, historyId } = await parseParams(context);
    await backendApiClient(`api/v1/animals/${id}/history/${item}/${historyId}`, 'DELETE');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
