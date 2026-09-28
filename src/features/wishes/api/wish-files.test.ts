import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  validatePresignedUrl: vi.fn((value: unknown) => String(value)),
}));

vi.mock('@/shared/api/web-api-client', () => ({
  webApiClient: { get: mocks.get, post: mocks.post, delete: mocks.delete },
}));
vi.mock('@/shared/security/presigned-url', () => ({
  validatePresignedUrl: mocks.validatePresignedUrl,
}));

import { deleteOrphanWishImage, getWishImageUrl, uploadWishImage } from './wish-files';

const storedFilename = `${'a'.repeat(32)}.jpg`;

describe('wish-files', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it('récupère une image dans le contexte du souhait', async () => {
    mocks.get.mockResolvedValue({ data: { url: 'https://storage.example/wish.jpg?signature=test' } });

    await expect(getWishImageUrl('photo été.jpg', 12)).resolves.toContain('storage.example');

    expect(mocks.get).toHaveBeenCalledWith('/files/photo%20%C3%A9t%C3%A9.jpg?resourceType=wish&resourceId=12');
    expect(mocks.validatePresignedUrl).toHaveBeenCalledOnce();
  });

  it('refuse les fichiers invalides avant toute requête', async () => {
    await expect(uploadWishImage(new File(['texte'], 'preuve.txt', { type: 'text/plain' }), 12))
      .rejects.toThrow('750 Ko');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('transfère une image puis confirme son stockage', async () => {
    const file = new File(['image'], 'souhait.jpg', { type: 'image/jpeg' });
    mocks.post
      .mockResolvedValueOnce({
        data: {
          url: 'https://storage.example/upload',
          fields: { key: storedFilename, policy: 'signed-policy' },
          filename: storedFilename,
        },
      })
      .mockResolvedValueOnce({ data: {} });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadWishImage(file, 12)).resolves.toBe(storedFilename);

    expect(mocks.post).toHaveBeenNthCalledWith(1, '/files/upload-url', expect.objectContaining({
      filename: 'souhait.jpg',
      resourceType: 'wish',
      resourceId: 12,
    }));
    expect(fetchMock).toHaveBeenCalledWith('https://storage.example/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }));
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/files/upload-complete', expect.objectContaining({
      filename: storedFilename,
    }));
  });

  it('signale un échec du stockage distant', async () => {
    const file = new File(['image'], 'souhait.jpg', { type: 'image/jpeg' });
    mocks.post.mockResolvedValue({
      data: { url: 'https://storage.example/upload', fields: {}, filename: storedFilename },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(uploadWishImage(file, 12)).rejects.toThrow('transfert');
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });

  it('supprime une image orpheline dans le bon contexte', async () => {
    mocks.delete.mockResolvedValue({});

    await deleteOrphanWishImage('ancienne image.jpg', 12);

    expect(mocks.delete).toHaveBeenCalledWith('/files/ancienne%20image.jpg?resourceType=wish&resourceId=12');
  });
});
