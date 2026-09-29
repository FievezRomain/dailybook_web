import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { groupIdSchema, groupSchema, respondAnimalShareSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = groupIdSchema.parse((await context.params).id);
    const body = await parseJson(request, respondAnimalShareSchema);
    return bffSuccess(groupSchema.parse(await backendApiClient(`api/v1/animal-shares/${id}`, 'PATCH', body)));
  } catch (error) {
    return bffError(error);
  }
}
