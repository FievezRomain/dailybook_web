import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import { groupIdSchema, groupListSchema, groupSchema, updateGroupSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = groupIdSchema.parse((await context.params).id);
    const body = await parseJson(request, updateGroupSchema);
    return bffSuccess(groupSchema.parse(await backendApiClient(`api/v1/groups/${id}`, 'PUT', body)));
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = groupIdSchema.parse((await context.params).id);
    groupListSchema.parse(await backendApiClient(`api/v1/groups/${id}`, 'DELETE'));
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
