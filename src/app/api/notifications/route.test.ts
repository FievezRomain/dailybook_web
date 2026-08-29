import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, PATCH } from './route';

const backendNotification = {
  id: 4,
  user_id: 8,
  email: 'private@example.com',
  type: 'group_member',
  title: 'Invitation',
  message: 'Une invitation vous attend.',
  object_id: 12,
  is_read: false,
  created_at: '2026-08-24T10:00:00+00:00',
  action_available: true,
  proposed_by: 'manager@example.com (Alix)',
};

function mutation(csrf = true) {
  return new Request('http://localhost/api/notifications', {
    method: 'PATCH',
    headers: {
      origin: 'http://localhost',
      ...(csrf ? { cookie: 'vasco-csrf=t', 'x-csrf-token': 't' } : {}),
    },
  });
}

describe('/api/notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('expose la liste persistante et le compteur backend sans identité interne', async () => {
    backendApiClient.mockResolvedValue({ notifications: [backendNotification], unreadCount: 1 });
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ unreadCount: 1, notifications: [{ id: 4, action_available: true }] });
    expect(body.notifications[0]).not.toHaveProperty('user_id');
    expect(body.notifications[0]).not.toHaveProperty('email');
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notifications');
  });

  it('refuse une enveloppe backend historique ou incomplète', async () => {
    backendApiClient.mockResolvedValue([backendNotification]);
    expect((await GET()).status).toBe(422);
  });

  it('marque toutes les notifications comme lues avec CSRF', async () => {
    backendApiClient.mockResolvedValue({ message: 'Toutes les notifications sont lues.' });
    expect((await PATCH(mutation())).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/notifications', 'PATCH');
  });

  it('refuse la lecture globale sans CSRF', async () => {
    expect((await PATCH(mutation(false))).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
