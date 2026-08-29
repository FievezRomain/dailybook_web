import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { PATCH } from './route';

function request(body: unknown, csrf = true) {
  return new Request('http://localhost/api/me/notification-preferences', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      ...(csrf ? { cookie: 'vasco-csrf=t', 'x-csrf-token': 't' } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('/api/me/notification-preferences', () => {
  beforeEach(() => vi.clearAllMocks());

  it('met à jour le rappel quotidien avec le contrat public camelCase', async () => {
    backendApiClient.mockResolvedValue({ daily_reminder_enabled: false });
    const body = { dailyReminderEnabled: false };
    const response = await PATCH(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(body);
    expect(backendApiClient).toHaveBeenCalledWith(
      'api/v1/users/me/notification-preferences',
      'PATCH',
      body,
    );
  });

  it('refuse une préférence inconnue ou une mutation sans CSRF', async () => {
    expect((await PATCH(request({ marketingEnabled: true }))).status).toBe(422);
    expect((await PATCH(request({ dailyReminderEnabled: true }, false))).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
