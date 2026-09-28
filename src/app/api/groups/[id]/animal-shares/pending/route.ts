import { backendApiClient } from '@/shared/api/backend-api-client';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { groupIdSchema, pendingAnimalShareListSchema } from '@/features/groups/schemas/group';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = groupIdSchema.parse((await context.params).id);
    return bffSuccess(pendingAnimalShareListSchema.parse(
      await backendApiClient(`api/v1/groups/${id}/animal-shares/pending`),
    ));
  } catch (error) {
    return bffError(error);
  }
}
