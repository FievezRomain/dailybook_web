import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { backendSessionSchema, openUserSessionSchema } from '@/features/user/schemas/user';

export async function POST(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;

  try {
    const body = await parseJson(request, openUserSessionSchema);
    const session = backendSessionSchema.parse(
      await backendApiClient('api/v1/auth/session', 'POST', body),
    );
    return bffSuccess(session);
  } catch (error) {
    return bffError(error);
  }
}
