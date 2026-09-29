import { describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { PATCH } from './route';

const context = { params: Promise.resolve({ id: '3', subtaskId: '9' }) };
function request(body: unknown) {
  return new Request('http://localhost/api/objectifs/3/subtasks/9', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/objectifs/[id]/subtasks/[subtaskId]', () => {
  it('borne la mutation atomique au booléen state', async () => {
    backendApiClient.mockResolvedValue({ id: 9, state: true });
    const response = await PATCH(request({ state: true }), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/objectifs/3/subtasks/9', 'PATCH', { state: true });

    expect((await PATCH(request({ state: true, title: 'injecté' }), context)).status).toBe(422);
  });
});
