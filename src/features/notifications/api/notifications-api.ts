import { webApiClient } from '@/shared/api/web-api-client';
import { notificationPreferencesSchema, notificationsResponseSchema } from '../schemas/notification';
import type { SetNotificationReadInput, UpdateNotificationPreferencesInput } from '../types/notification';

export async function getNotifications() {
  return notificationsResponseSchema.parse((await webApiClient.get('/notifications')).data);
}

export async function markAllNotificationsRead() {
  await webApiClient.patch('/notifications');
}

export async function setNotificationRead(id: number, input: SetNotificationReadInput) {
  await webApiClient.patch(`/notifications/${id}`, input);
}

export async function deleteNotification(id: number) {
  await webApiClient.delete(`/notifications/${id}`);
}

export async function updateNotificationPreferences(input: UpdateNotificationPreferencesInput) {
  return notificationPreferencesSchema.parse(
    (await webApiClient.patch('/me/notification-preferences', input)).data,
  );
}
