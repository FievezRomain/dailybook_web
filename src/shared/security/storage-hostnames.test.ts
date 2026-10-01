import { describe, expect, it } from 'vitest';

import { createStorageRemotePatterns, resolveStorageHostnames } from './storage-hostnames';

describe('storage hostnames', () => {
  it('partage les endpoints régional et global du même bucket S3', () => {
    expect(resolveStorageHostnames('vascoandco-storage.s3.eu-north-1.amazonaws.com')).toEqual([
      'vascoandco-storage.s3.eu-north-1.amazonaws.com',
      'vascoandco-storage.s3.amazonaws.com',
    ]);

    expect(createStorageRemotePatterns('vascoandco-storage.s3.eu-north-1.amazonaws.com'))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ hostname: 'vascoandco-storage.s3.eu-north-1.amazonaws.com' }),
        expect.objectContaining({ hostname: 'vascoandco-storage.s3.amazonaws.com' }),
      ]));
  });

  it('conserve un domaine de stockage non S3 sans élargir la liste', () => {
    expect(resolveStorageHostnames('storage.example')).toEqual(['storage.example']);
  });

  it.each([undefined, '', 'example.com; img-src *', 'localhost'])('refuse une configuration invalide : %s', (hostname) => {
    expect(() => resolveStorageHostnames(hostname)).toThrow('Invalid storage hostname configuration.');
  });
});
