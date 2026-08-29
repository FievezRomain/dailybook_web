import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { GET, POST } from './route';

const contact = { id: 1, nom: 'Dr Dupont', profession: 'Vétérinaire', telephone: null, email: 'vet@example.com' };

function request(body: unknown, csrf = true) {
  return new Request('http://localhost/api/contacts', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      ...(csrf ? { cookie: 'vasco-csrf=t', 'x-csrf-token': 't' } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('/api/contacts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lit exclusivement la liste REST courante', async () => {
    backendApiClient.mockResolvedValueOnce([contact]);
    expect((await GET()).status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/contacts');
    backendApiClient.mockResolvedValueOnce({ rows: [contact] });
    expect((await GET()).status).toBe(422);
  });

  it('valide puis crée un contact', async () => {
    backendApiClient.mockResolvedValue(contact);
    const body = { nom: 'Dr Dupont', email_contact: 'vet@example.com' };
    const response = await POST(request(body));
    expect(response.status).toBe(201);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/contacts', 'POST', body);
  });

  it('refuse une adresse invalide et une mutation sans CSRF', async () => {
    expect((await POST(request({ nom: 'Dr Dupont', email_contact: 'incorrect' }))).status).toBe(422);
    expect((await POST(request({ nom: 'Dr Dupont' }, false))).status).toBe(403);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
