import type { User as FirebaseUser } from 'firebase/auth';
import { webApiClient } from '@/shared/api/web-api-client';
import { currentUserSchema, backendSessionSchema } from '../schemas/user';
import type { CurrentUser, OpenUserSessionInput, UpdateCurrentUserInput } from '../types/user';

export async function openUserSession(input: OpenUserSessionInput) {
  const response = await webApiClient.post('/auth/session', input);
  return backendSessionSchema.parse(response.data);
}

export async function establishAuthenticatedSession(user: FirebaseUser): Promise<void> {
  const idToken = await user.getIdToken(true);
  await webApiClient.post('/session/login', { idToken });
  try {
    await openUserSession({
      firstName: user.displayName?.trim() || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (error) {
    await webApiClient.post('/session/logout').catch(() => undefined);
    throw error;
  }
}

export async function closeAuthenticatedSession(): Promise<void> {
  await webApiClient.post('/session/logout');
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await webApiClient.get('/me');
  return currentUserSchema.parse(response.data);
}

export async function updateCurrentUser(input: UpdateCurrentUserInput): Promise<CurrentUser> {
  const response = await webApiClient.patch('/me', input);
  return currentUserSchema.parse(response.data);
}
