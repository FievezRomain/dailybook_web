import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteAnimalFile, uploadAnimalFile } from './animal-files';

const mocks = vi.hoisted(() => ({
  del: vi.fn(),
  post: vi.fn(),
  validate: vi.fn((value: string) => value),
}));

vi.mock('@/shared/api/web-api-client', () => ({ webApiClient: { delete: mocks.del, post: mocks.post } }));
vi.mock('@/shared/security/presigned-url', () => ({ validatePresignedUrl: mocks.validate }));

const filename = `${'a'.repeat(32)}.webp`;

describe('fichiers animaux', () => {
  beforeEach(() => {
    mocks.del.mockReset();
    mocks.post.mockReset();
    mocks.validate.mockClear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('refuse les contenus actifs avant de demander un ticket', async () => {
    const file = new File(['<svg/>'], 'photo.svg', { type: 'image/svg+xml' });

    await expect(uploadAnimalFile(file, 'body', 7)).rejects.toThrow('JPEG, PNG ou WebP');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('enchaîne ticket, transfert et confirmation pour le suivi corporel', async () => {
    const file = new File(['photo'], 'suivi.webp', { type: 'image/webp' });
    mocks.post
      .mockResolvedValueOnce({ data: { url: 'https://storage.example.test/upload', fields: { key: filename }, filename } })
      .mockResolvedValueOnce({ data: {} });

    await expect(uploadAnimalFile(file, 'body', 12)).resolves.toBe(filename);
    expect(mocks.post).toHaveBeenNthCalledWith(1, '/files/upload-url', expect.objectContaining({ resourceType: 'body', resourceId: 12, contentType: 'image/webp' }));
    expect(fetch).toHaveBeenCalledWith('https://storage.example.test/upload', expect.objectContaining({ method: 'POST' }));
    expect(mocks.post).toHaveBeenNthCalledWith(2, '/files/upload-complete', { filename, contentType: 'image/webp', resourceType: 'body', resourceId: 12 });
  });

  it('supprime un upload orphelin avec sa portée animale', async () => {
    await deleteAnimalFile(filename, 'body', 12);

    expect(mocks.del).toHaveBeenCalledWith(`/files/${filename}?resourceType=body&resourceId=12`);
  });
});
