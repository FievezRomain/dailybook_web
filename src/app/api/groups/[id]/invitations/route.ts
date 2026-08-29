import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { groupIdSchema, groupSchema, inviteMembersSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const id = groupIdSchema.parse((await context.params).id);
    const body = await parseJson(request, inviteMembersSchema);
    return bffSuccess(groupSchema.parse(await backendApiClient(`api/v1/groups/${id}/invitations`, 'POST', body)));
  } catch (error) {
    return bffError(error);
  }
}
