import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { createGroupSchema, groupListSchema, groupSchema } from '@/features/groups/schemas/group';

export async function GET() {
  try {
    return bffSuccess(groupListSchema.parse(await backendApiClient('api/v1/groups')));
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, createGroupSchema);
    return bffSuccess(groupSchema.parse(await backendApiClient('api/v1/groups', 'POST', body)), { status: 201 });
  } catch (error) {
    return bffError(error);
  }
}
