import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { groupAnimalListSchema, groupIdSchema, groupSchema, proposeAnimalsSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = groupIdSchema.parse((await context.params).id);
    return bffSuccess(groupAnimalListSchema.parse(await backendApiClient(`api/v1/groups/${id}/animals`)));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = groupIdSchema.parse((await context.params).id);
    const body = await parseJson(request, proposeAnimalsSchema);
    return bffSuccess(groupSchema.parse(await backendApiClient(`api/v1/groups/${id}/animals`, 'POST', body)));
  } catch (error) {
    return bffError(error);
  }
}
