import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  objectiveIdSchema, subtaskIdSchema, subtaskStateResponseSchema, subtaskStateSchema,
} from '@/features/objectives/schemas/objective';

type RouteContext = { params: Promise<{ id: string; subtaskId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const values = await context.params;
    const objectiveId = objectiveIdSchema.parse(values.id);
    const subtaskId = subtaskIdSchema.parse(values.subtaskId);
    const body = await parseJson(request, subtaskStateSchema);
    return bffSuccess(subtaskStateResponseSchema.parse(
      await backendApiClient(`api/v1/objectifs/${objectiveId}/subtasks/${subtaskId}`, 'PATCH', body),
    ));
  } catch (error) {
    return bffError(error);
  }
}
