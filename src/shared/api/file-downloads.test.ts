import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  validate: vi.fn((value: unknown) => String(value)),
}));
vi.mock('./web-api-client', () => ({ webApiClient: { post: mocks.post } }));
vi.mock('@/shared/security/presigned-url', () => ({ validatePresignedUrl: mocks.validate }));

import { getFileDownloadUrls } from './file-downloads';

describe('getFileDownloadUrls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('récupère les URL en une requête et ignore une image indisponible', async () => {
    mocks.post.mockResolvedValue({ data: [
      { fileName: 'milo.jpg', ressourceType: 'animal', ressourceId: 4, url: 'https://storage.example/milo.jpg' },
      { fileName: 'old.jpg', ressourceType: 'animal', ressourceId: 5, url: null },
    ] });

    const result = await getFileDownloadUrls([
      { fileName: 'milo.jpg', resourceType: 'animal', resourceId: 4 },
      { fileName: 'old.jpg', resourceType: 'animal', resourceId: 5 },
    ]);

    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(result.get('animal:4:milo.jpg')).toBe('https://storage.example/milo.jpg');
    expect(result.has('animal:5:old.jpg')).toBe(false);
  });

  it('ne contacte pas le BFF pour une liste vide', async () => {
    await expect(getFileDownloadUrls([])).resolves.toEqual(new Map());
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
