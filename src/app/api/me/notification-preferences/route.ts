import { backendApiClient } from '@/shared/api/backend-api-client';
import { parseJson, validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import {
  backendNotificationPreferencesSchema,
  notificationPreferencesSchema,
  updateNotificationPreferencesSchema,
} from '@/features/notifications/schemas/notification';

export async function PATCH(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    const body = await parseJson(request, updateNotificationPreferencesSchema);
    const backendData = backendNotificationPreferencesSchema.parse(await backendApiClient(
      'api/v1/users/me/notification-preferences',
      'PATCH',
      body,
    ));
    return bffSuccess(notificationPreferencesSchema.parse({
      dailyReminderEnabled: backendData.daily_reminder_enabled,
    }));
  } catch (error) {
    return bffError(error);
  }
}
