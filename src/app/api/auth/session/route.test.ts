import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { POST } from './route';

function request(body: unknown, csrf = 'token') {
  return new Request('http://localhost/api/auth/session', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      cookie: `vasco-csrf=${csrf}`,
      'x-csrf-token': csrf,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/session', () => {
  beforeEach(() => vi.clearAllMocks());

  it('relaie uniquement le contrat validé vers /api/v1/auth/session', async () => {
    backendApiClient.mockResolvedValue({ subscription: 'Premium' });
    const response = await POST(request({ firstName: 'Alice', timezone: 'Europe/Paris' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ subscription: 'Premium' });
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/auth/session', 'POST', {
      firstName: 'Alice', timezone: 'Europe/Paris',
    });
  });

  it('refuse un champ inconnu avant FastAPI', async () => {
    const response = await POST(request({ timezone: 'Europe/Paris', admin: true }));
    expect(response.status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });

  it('refuse une mutation sans CSRF valide', async () => {
    const invalid = request({ timezone: 'Europe/Paris' }, 'cookie-token');
    invalid.headers.set('x-csrf-token', 'other-token');
    const response = await POST(invalid);
    expect(response.status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
