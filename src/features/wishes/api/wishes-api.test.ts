import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/shared/api/web-api-client', () => ({
  webApiClient: { get: mocks.get, post: mocks.post, put: mocks.put, delete: mocks.delete },
}));

import { createWish, deleteWish, getWishes, updateWish } from './wishes-api';

const wish = { id: 4, nom: 'Tapis', url: 'https://example.com/tapis', prix: '89.90', acquis: false };

describe('wishes-api', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valide les lectures et les mutations', async () => {
    mocks.get.mockResolvedValue({ data: [wish] });
    mocks.post.mockResolvedValue({ data: wish });
    mocks.put.mockResolvedValue({ data: { ...wish, acquis: true } });
    mocks.delete.mockResolvedValue({});

    await expect(getWishes()).resolves.toEqual([wish]);
    await expect(createWish({ nom: 'Tapis' })).resolves.toEqual(wish);
    await expect(updateWish(4, { nom: 'Tapis', acquis: true })).resolves.toMatchObject({ acquis: true });
    await expect(deleteWish(4)).resolves.toBeUndefined();

    expect(mocks.get).toHaveBeenCalledWith('/wishes');
    expect(mocks.post).toHaveBeenCalledWith('/wishes', { nom: 'Tapis' });
    expect(mocks.put).toHaveBeenCalledWith('/wishes/4', { nom: 'Tapis', acquis: true });
    expect(mocks.delete).toHaveBeenCalledWith('/wishes/4');
  });
});
