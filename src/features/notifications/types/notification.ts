import type { z } from 'zod';
import type {
  notificationPreferencesSchema,
  notificationSchema,
  notificationsResponseSchema,
  setNotificationReadSchema,
  updateNotificationPreferencesSchema,
} from '../schemas/notification';

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type SetNotificationReadInput = z.input<typeof setNotificationReadSchema>;
export type UpdateNotificationPreferencesInput = z.input<typeof updateNotificationPreferencesSchema>;
