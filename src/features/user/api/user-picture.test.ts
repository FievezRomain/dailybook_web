import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}));

vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: api }));

import { getUserPictureUrl, removeUserPicture, uploadUserPicture } from './user-picture';

const filename = '0123456789abcdef0123456789abcdef.jpg';

describe('user picture API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'storage.example');
    vi.stubGlobal('fetch', vi.fn());
  });

  it('refuse un type actif avant toute requête', async () => {
    const file = new File(['<svg/>'], 'avatar.svg', { type: 'image/svg+xml' });
    await expect(uploadUserPicture(file)).rejects.toThrow('JPEG, PNG ou WebP');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('utilise le ticket POST, confirme puis rattache le filename', async () => {
    const file = new File(['image'], 'avatar.jpg', { type: 'image/jpeg' });
    api.post
      .mockResolvedValueOnce({ data: { url: 'https://storage.example/upload', fields: { key: 'uid/file' }, filename } })
      .mockResolvedValueOnce({ data: { filename } });
    api.patch.mockResolvedValue({ data: {} });
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(uploadUserPicture(file)).resolves.toBe(filename);
    expect(api.post).toHaveBeenNthCalledWith(2, '/files/upload-complete', {
      filename, contentType: 'image/jpeg',
    });
    expect(api.patch).toHaveBeenCalledWith('/me', { image: filename });
  });

  it('supprime le fichier orphelin si le rattachement échoue', async () => {
    const file = new File(['image'], 'avatar.jpg', { type: 'image/jpeg' });
    api.post
      .mockResolvedValueOnce({ data: { url: 'https://storage.example/upload', fields: {}, filename } })
      .mockResolvedValueOnce({ data: { filename } });
    api.patch.mockRejectedValue(new Error('backend unavailable'));
    api.delete.mockResolvedValue({});
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

    await expect(uploadUserPicture(file)).rejects.toThrow('backend unavailable');
    expect(api.delete).toHaveBeenCalledWith(`/files/${filename}`);
  });

  it('lit et retire la photo exclusivement via le BFF', async () => {
    api.get.mockResolvedValue({ data: { url: 'https://storage.example/avatar' } });
    api.patch.mockResolvedValue({});

    await expect(getUserPictureUrl(filename)).resolves.toBe('https://storage.example/avatar');
    await removeUserPicture();

    expect(api.get).toHaveBeenCalledWith(`/files/${filename}`);
    expect(api.patch).toHaveBeenCalledWith('/me', { image: null });
  });
});
