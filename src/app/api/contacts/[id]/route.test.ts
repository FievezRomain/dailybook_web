import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, PUT } from './route';

const context = { params: Promise.resolve({ id: '4' }) };
function request(method: string, body?: unknown) {
  return new Request('http://localhost/api/contacts/4', {
    method,
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('/api/contacts/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('injecte exclusivement l’identifiant du chemin dans la modification', async () => {
    const contact = { id: 4, nom: 'Clinique Vasco', profession: null, telephone: null, email: null };
    backendApiClient.mockResolvedValue(contact);
    const response = await PUT(request('PUT', { nom: 'Clinique Vasco' }), context);
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/contacts/4', 'PUT', { id: 4, nom: 'Clinique Vasco' });
  });

  it('supprime sans payload legacy', async () => {
    backendApiClient.mockResolvedValue({ message: 'Suppression réussie' });
    expect((await DELETE(request('DELETE'), context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/contacts/4', 'DELETE');
  });
});
