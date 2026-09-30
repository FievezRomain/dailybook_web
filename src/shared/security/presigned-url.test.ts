import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openPresignedUrl, validatePresignedUrl } from './presigned-url';

describe('presigned URL security', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'vasco-files.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('accepte uniquement une URL HTTPS du hostname configuré', () => {
    expect(validatePresignedUrl('https://vasco-files.example.com/user/file.jpg?X-Signature=abc'))
      .toBe('https://vasco-files.example.com/user/file.jpg?X-Signature=abc');
  });

  it('accepte l’endpoint S3 global du même bucket lorsque l’endpoint régional est configuré', () => {
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'vascoandco-storage.s3.eu-north-1.amazonaws.com');

    expect(validatePresignedUrl('https://vascoandco-storage.s3.eu-north-1.amazonaws.com/file.jpg'))
      .toBe('https://vascoandco-storage.s3.eu-north-1.amazonaws.com/file.jpg');
    expect(validatePresignedUrl('https://vascoandco-storage.s3.amazonaws.com/file.jpg'))
      .toBe('https://vascoandco-storage.s3.amazonaws.com/file.jpg');
  });

  it.each([
    'https://other-bucket.s3.amazonaws.com/file.jpg',
    'https://vascoandco-storage.s3.eu-west-1.amazonaws.com/file.jpg',
  ])('refuse une autre destination S3 malgré l’alias global autorisé : %s', (url) => {
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'vascoandco-storage.s3.eu-north-1.amazonaws.com');
    expect(() => validatePresignedUrl(url)).toThrow('refusée');
  });

  it.each([
    'http://vasco-files.example.com/file.jpg',
    'https://evil.example.com/file.jpg',
    'https://vasco-files.example.com.evil.test/file.jpg',
    'https://user:password@vasco-files.example.com/file.jpg',
    'https://vasco-files.example.com:8443/file.jpg',
    'https://vasco-files.example.com/file.jpg#fragment',
    'javascript:alert(1)',
    'data:text/html,attack',
  ])('refuse %s', (url) => {
    expect(() => validatePresignedUrl(url)).toThrow();
  });

  it('reste fermé si le hostname public est absent ou invalide', () => {
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', '');
    expect(() => validatePresignedUrl('https://vasco-files.example.com/file.jpg')).toThrow('mal configuré');
    vi.stubEnv('NEXT_PUBLIC_BUCKET_HOSTNAME', 'example.com; connect-src *');
    expect(() => validatePresignedUrl('https://example.com/file.jpg')).toThrow('mal configuré');
  });

  it('ouvre avec noopener,noreferrer après validation', () => {
    const opened = { opener: window } as unknown as Window;
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(opened);
    openPresignedUrl('https://vasco-files.example.com/file.pdf?signature=abc');
    expect(windowOpen).toHaveBeenCalledWith(
      'https://vasco-files.example.com/file.pdf?signature=abc', '_blank', 'noopener,noreferrer',
    );
    expect(opened.opener).toBeNull();
  });

  it('n’ouvre jamais une URL refusée', () => {
    const windowOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    expect(() => openPresignedUrl('https://evil.example/file.pdf')).toThrow('refusée');
    expect(windowOpen).not.toHaveBeenCalled();
  });
});
