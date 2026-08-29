import { beforeEach, describe, expect, it, vi } from 'vitest';

const backendApiBinary = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/backend-api-client', () => ({ backendApiBinary }));

import { GET } from './route';

describe('GET /api/animals/[id]/medical-record', () => {
  beforeEach(() => backendApiBinary.mockReset());

  it('relaie uniquement le PDF privé avec des headers de téléchargement sûrs', async () => {
    backendApiBinary.mockResolvedValue({
      body: Uint8Array.from([37, 80, 68, 70]).buffer as ArrayBuffer,
      contentType: 'application/pdf; charset=binary',
      contentDisposition: 'attachment; filename="unsafe.pdf"',
    });

    const response = await GET(new Request('http://localhost/api/animals/4/medical-record'), {
      params: Promise.resolve({ id: '4' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(response.headers.get('content-disposition')).toContain('synthese-dossier-medical-4.pdf');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(backendApiBinary).toHaveBeenCalledWith('api/v1/animals/4/medical-record');
  });

  it('refuse une réponse qui ne serait pas un PDF', async () => {
    backendApiBinary.mockResolvedValue({
      body: new ArrayBuffer(0), contentType: 'text/html',
    });
    const response = await GET(new Request('http://localhost/api/animals/4/medical-record'), {
      params: Promise.resolve({ id: '4' }),
    });
    expect(response.status).toBe(500);
  });
});
