import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  bodyPictureListSchema, bodyPictureSchema, createBodyPictureSchema, positiveIdSchema,
} from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    return bffSuccess(bodyPictureListSchema.parse(await backendApiClient(`api/v1/animals/${id}/body-pictures`)));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    const body = await parseJson(request, createBodyPictureSchema);
    return bffSuccess(bodyPictureSchema.parse(
      await backendApiClient(`api/v1/animals/${id}/body-pictures`, 'POST', { ...body, idanimal: id }),
    ), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
