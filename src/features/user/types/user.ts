import type { z } from 'zod';
import type {
  currentUserSchema,
  openUserSessionSchema,
  subscriptionSchema,
  updateCurrentUserSchema,
} from '../schemas/user';

export type Subscription = z.infer<typeof subscriptionSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type OpenUserSessionInput = z.infer<typeof openUserSessionSchema>;
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>;

export type UserWithPicture = CurrentUser & {
  pictureUrl?: string;
};
