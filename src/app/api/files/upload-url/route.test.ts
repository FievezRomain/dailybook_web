import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiClient = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiClient }));
vi.mock('@/shared/security/presigned-url', () => ({ validatePresignedUrl: (url: unknown) => String(url) }));

import { POST } from './route';

function request(body: unknown) {
  return new Request('http://localhost/api/files/upload-url', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost', cookie: 'vasco-csrf=t', 'x-csrf-token': 't' },
    body: JSON.stringify(body),
  });
}

describe('/api/files/upload-url', () => {
  beforeEach(() => vi.clearAllMocks());

  it('dérive toujours la ressource utilisateur côté serveur', async () => {
    backendApiClient.mockResolvedValueOnce({ id: 9 }).mockResolvedValueOnce({
      url: 'https://files.example.test', fields: {}, filename: 'a'.repeat(32) + '.jpg',
    });
    expect((await POST(request({ filename: 'photo.jpg', contentType: 'image/jpeg', sizeBytes: 100 }))).status).toBe(200);
    expect(backendApiClient).toHaveBeenNthCalledWith(2, 'api/v1/files/upload-url', 'POST', {
      filename: 'photo.jpg', contentType: 'image/jpeg', sizeBytes: 100, ressourceType: 'user', ressourceId: 9,
    });
  });

  it('accepte uniquement une ressource animale explicite et complète', async () => {
    backendApiClient.mockResolvedValue({
      url: 'https://files.example.test', fields: {}, filename: 'b'.repeat(32) + '.webp',
    });
    const response = await POST(request({
      filename: 'suivi.webp', contentType: 'image/webp', sizeBytes: 1000, resourceType: 'body', resourceId: 7,
    }));
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/files/upload-url', 'POST', {
      filename: 'suivi.webp', contentType: 'image/webp', sizeBytes: 1000, ressourceType: 'body', ressourceId: 7,
    });
  });

  it('accepte un document événement avant la création de l’événement', async () => {
    backendApiClient.mockResolvedValue({
      url: 'https://files.example.test', fields: {}, filename: 'c'.repeat(32) + '.pdf',
    });
    const response = await POST(request({
      filename: 'analyse.pdf', contentType: 'application/pdf', sizeBytes: 1000, resourceType: 'event',
    }));
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/files/upload-url', 'POST', {
      filename: 'analyse.pdf', contentType: 'application/pdf', sizeBytes: 1000,
      ressourceType: 'event', ressourceId: undefined,
    });
  });

  it('accepte une image de souhait bornée et liée à son identifiant', async () => {
    backendApiClient.mockResolvedValue({
      url: 'https://files.example.test', fields: {}, filename: 'd'.repeat(32) + '.jpg',
    });
    const response = await POST(request({
      filename: 'souhait.jpg', contentType: 'image/jpeg', sizeBytes: 700_000, resourceType: 'wish', resourceId: 1,
    }));
    expect(response.status).toBe(200);
    expect(backendApiClient).toHaveBeenCalledWith('api/v1/files/upload-url', 'POST', {
      filename: 'souhait.jpg', contentType: 'image/jpeg', sizeBytes: 700_000, ressourceType: 'wish', ressourceId: 1,
    });
  });

  it('refuse un type arbitraire, un identifiant manquant ou une image de souhait trop lourde', async () => {
    expect((await POST(request({ filename: 'x.jpg', contentType: 'image/jpeg', sizeBytes: 10, resourceType: 'group', resourceId: 1 }))).status).toBe(422);
    expect((await POST(request({ filename: 'x.jpg', contentType: 'image/jpeg', sizeBytes: 10, resourceType: 'animal' }))).status).toBe(422);
    expect((await POST(request({ filename: 'x.jpg', contentType: 'image/jpeg', sizeBytes: 750 * 1024 + 1, resourceType: 'wish', resourceId: 1 }))).status).toBe(422);
    expect(backendApiClient).not.toHaveBeenCalled();
  });
});
