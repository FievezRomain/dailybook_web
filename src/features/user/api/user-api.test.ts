import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: api }));

import {
  closeAuthenticatedSession,
  establishAuthenticatedSession,
  getCurrentUser,
  openUserSession,
  updateCurrentUser,
} from './user-api';

const currentUser = {
  id: 7,
  name: 'Alice',
  email: 'alice@example.com',
  picture: null,
  expotoken: null,
  timezone: 'Europe/Paris',
  dailyReminderEnabled: true,
  subscription: 'Premium',
};

describe('user API', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ouvre la session métier via la route BFF courante', async () => {
    api.post.mockResolvedValue({ data: { subscription: 'Free' } });

    await expect(openUserSession({ firstName: 'Alice', timezone: 'Europe/Paris' }))
      .resolves.toEqual({ subscription: 'Free' });
    expect(api.post).toHaveBeenCalledWith('/auth/session', {
      firstName: 'Alice', timezone: 'Europe/Paris',
    });
  });

  it('crée le cookie avant la session métier', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'success' } })
      .mockResolvedValueOnce({ data: { subscription: 'Premium' } });
    const firebaseUser = {
      displayName: 'Alice',
      getIdToken: vi.fn().mockResolvedValue('firebase-id-token'),
    };

    await establishAuthenticatedSession(firebaseUser as never);

    expect(api.post).toHaveBeenNthCalledWith(1, '/session/login', { idToken: 'firebase-id-token' });
    expect(api.post).toHaveBeenNthCalledWith(2, '/auth/session', expect.objectContaining({ firstName: 'Alice' }));
  });

  it('détruit la demi-session si FastAPI refuse le profil', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'success' } })
      .mockRejectedValueOnce(new Error('backend unavailable'))
      .mockResolvedValueOnce({ data: { success: true } });
    const firebaseUser = { displayName: null, getIdToken: vi.fn().mockResolvedValue('token') };

    await expect(establishAuthenticatedSession(firebaseUser as never)).rejects.toThrow('backend unavailable');
    expect(api.post).toHaveBeenLastCalledWith('/session/logout');
  });

  it('ferme la session via le client BFF commun', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await expect(closeAuthenticatedSession()).resolves.toBeUndefined();

    expect(api.post).toHaveBeenCalledWith('/session/logout');
  });

  it('valide les lectures et mises à jour du profil', async () => {
    api.get.mockResolvedValue({ data: currentUser });
    api.patch.mockResolvedValue({ data: currentUser });

    await expect(getCurrentUser()).resolves.toEqual(currentUser);
    await expect(updateCurrentUser({ prenom: 'Alice' })).resolves.toEqual(currentUser);
    expect(api.get).toHaveBeenCalledWith('/me');
    expect(api.patch).toHaveBeenCalledWith('/me', { prenom: 'Alice' });
  });

  it('refuse une réponse utilisateur divergente', async () => {
    api.get.mockResolvedValue({ data: { ...currentUser, subscription: 'Gold' } });
    await expect(getCurrentUser()).rejects.toMatchObject({ name: 'ZodError' });
  });
});
