import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createObjectiveSchema, objectiveListSchema, objectiveSchema } from '@/features/objectives/schemas/objective';

export async function GET() {
  try {
    return bffSuccess(objectiveListSchema.parse(await backendApiClient('api/v1/objectifs')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createObjectiveSchema);
    return bffSuccess(objectiveSchema.parse(await backendApiClient('api/v1/objectifs', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
