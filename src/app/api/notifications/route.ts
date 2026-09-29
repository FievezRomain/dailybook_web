import { backendApiClient } from '@/shared/api/backend-api-client';
import { validateMutationRequest } from '@/shared/api/bff-request';
import { bffError, bffNoContent, bffSuccess } from '@/shared/api/bff-response';
import {
  backendNotificationsResponseSchema,
  notificationsResponseSchema,
} from '@/features/notifications/schemas/notification';

export async function GET() {
  try {
    const backendData = backendNotificationsResponseSchema.parse(
      await backendApiClient('api/v1/notifications'),
    );
    return bffSuccess(notificationsResponseSchema.parse({
      notifications: backendData.notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        object_id: notification.object_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        action_available: notification.action_available,
        proposed_by: notification.proposed_by,
      })),
      unreadCount: backendData.unreadCount,
    }));
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request) {
  const csrfError = validateMutationRequest(request);
  if (csrfError) return csrfError;
  try {
    await backendApiClient('api/v1/notifications', 'PATCH');
    return bffNoContent();
  } catch (error) {
    return bffError(error);
  }
}
