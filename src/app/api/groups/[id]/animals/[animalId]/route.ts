import { backendApiClient } from '@/shared/api/backend-api-client';
import { validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { groupIdSchema, groupSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string; animalId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const params = await context.params;
    const groupId = groupIdSchema.parse(params.id);
    const animalId = groupIdSchema.parse(params.animalId);
    return bffSuccess(groupSchema.parse(
      await backendApiClient(`api/v1/groups/${groupId}/animals/${animalId}`, 'DELETE'),
    ));
  } catch (error) {
    return bffError(error);
  }
}
