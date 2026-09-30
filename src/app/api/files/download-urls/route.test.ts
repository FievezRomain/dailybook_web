import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));
vi.mock('@/shared/security/presigned-url', () => ({ validatePresignedUrl: (url: unknown) => String(url) }));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/files/download-urls', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/files/download-urls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('transmet une liste bornée et conserve les images indisponibles sans faire échouer le lot', async () => {
    backendApiClient.mockResolvedValue([
      { fileName: 'milo.jpg', ressourceType: 'animal', ressourceId: 4, url: 'https://storage.example/milo.jpg' },
      { fileName: 'old.jpg', ressourceType: 'animal', ressourceId: 5, url: null },
    ]);
    const response = await POST(request({ items: [
      { fileName: 'milo.jpg', resourceType: 'animal', resourceId: 4 },
      { fileName: 'old.jpg', resourceType: 'animal', resourceId: 5 },
    ] }));

    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/files/download-urls', 'POST', { items: [
      { fileName: 'milo.jpg', ressourceType: 'animal', ressourceId: 4 },
      { fileName: 'old.jpg', ressourceType: 'animal', ressourceId: 5 },
    ] });
    await expect(response.json()).resolves.toMatchObject([
      { url: 'https://storage.example/milo.jpg' },
      { url: null },
    ]);
  });

  it('refuse les lots vides, trop grands et les types arbitraires', async () => {
    expect((await POST(request({ items: [] }))).status).toBe(422);
    expect((await POST(request({ items: Array.from({ length: 101 }, (_, index) => ({
      fileName: `${index}.jpg`, resourceType: 'animal', resourceId: index + 1,
    })) }))).status).toBe(422);
    expect((await POST(request({ items: [{ fileName: 'x.jpg', resourceType: 'admin', resourceId: 1 }] }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
