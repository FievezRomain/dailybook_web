import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { backendUserSchema, updateCurrentUserSchema } from '@/features/user/schemas/user';
import type { z } from 'zod';

type BackendUser = z.infer<typeof backendUserSchema>;

function toCurrentUser(user: BackendUser) {
  return {
    id: user.id,
    name: user.prenom ?? '',
    email: user.email,
    picture: user.filename ?? null,
    expotoken: user.expotoken ?? null,
    timezone: user.timezone ?? null,
    dailyReminderEnabled: user.daily_reminder_enabled,
    subscription: user.subscription,
  };
}

export async function GET() {
  try {
    const user = backendUserSchema.parse(await backendApiClient('api/v1/users/me'));
    return bffSuccess(toCurrentUser(user));
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, updateCurrentUserSchema);
    await backendApiClient('api/v1/users/me', 'PATCH', body);
    const user = backendUserSchema.parse(await backendApiClient('api/v1/users/me'));
    return bffSuccess(toCurrentUser(user));
  } catch (error) {
    return bffError(error);
  }
}
