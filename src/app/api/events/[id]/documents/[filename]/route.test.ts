import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));

import { DELETE, GET, POST } from './route';

const filename = '0123456789abcdef0123456789abcdef.pdf';
const context = { params: Promise.resolve({ id: '4', filename }) };

describe('/api/events/[id]/documents/[filename]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'storage.example');
  });

  it('valide et relaie une URL de téléchargement autorisée', async () => {
    backendApiClient.mockResolvedValue({ url: 'https://storage.example/document.pdf?signature=test' });

    const response = await GET(new Request(`http://localhost/api/events/4/documents/${filename}`), context);

    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith(`api/v1/events/4/documents/${filename}`);
  });

  it('protège la suppression et refuse un filename non généré', async () => {
    backendApiClient.mockResolvedValue({ message: 'Document supprimé' });
    const request = new Request(`http://localhost/api/events/4/documents/${filename}`, {
      method: 'DELETE',
      headers: { origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    });

    expect((await DELETE(request, context)).status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith(`api/v1/events/4/documents/${filename}`, 'DELETE');

    const invalidContext = { params: Promise.resolve({ id: '4', filename: 'invoice.pdf' }) };
    expect((await GET(new Request('http://localhost/api/events/4/documents/invoice.pdf'), invalidContext)).status).toBe(422);
  });

  it('rattache un upload finalisé avec une mutation protégée', async () => {
    const request = new Request(`http://localhost/api/events/4/documents/${filename}`, {
      method: 'POST',
      headers: { origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    });
    const response = await POST(request, context);

    expect(response.status).toBe(204);
    expect(backendApiClient).toHaveBeenCalledWith(`api/v1/events/4/documents/${filename}`, 'POST');
  });
});
