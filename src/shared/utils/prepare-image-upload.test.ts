import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSupportedImageUpload, prepareImageUpload } from './prepare-image-upload';

const closeBitmap = vi.fn();
const drawImage = vi.fn();
const putImageData = vi.fn();

describe('prepareImageUpload', () => {
  beforeEach(() => {
    closeBitmap.mockReset();
    drawImage.mockReset();
    putImageData.mockReset();
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({
      width: 4000,
      height: 3000,
      close: closeBitmap,
    }));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage,
      putImageData,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob([new Uint8Array(400)], { type: 'image/jpeg' }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('redimensionne et convertit une image navigateur avant tout upload', async () => {
    const source = new File([new Uint8Array(2_000)], 'photo.png', { type: 'image/png', lastModified: 42 });

    const prepared = await prepareImageUpload(source, 'animal');

    expect(prepared).toMatchObject({ name: 'photo.jpg', type: 'image/jpeg', size: 400, lastModified: 42 });
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 900);
    expect(closeBitmap).toHaveBeenCalledOnce();
  });

  it('décode HEIC dans un worker isolé puis retourne seulement le JPEG', async () => {
    const terminate = vi.fn();
    class WorkerMock {
      onmessage?: (event: MessageEvent) => void;
      onerror?: () => void;
      postMessage(message: { id: string }) {
        queueMicrotask(() => this.onmessage?.({
          data: {
            id: message.id,
            ok: true,
            width: 2,
            height: 2,
            pixels: new Uint8ClampedArray(16).buffer,
          },
        } as MessageEvent));
      }
      terminate = terminate;
    }
    vi.stubGlobal('Worker', WorkerMock);
    vi.stubGlobal('ImageData', class {
      constructor(public data: Uint8ClampedArray, public width: number, public height: number) {}
    });
    vi.stubGlobal('crypto', { randomUUID: () => 'conversion-id' });
    const source = new File([new Uint8Array(2_000)], 'iphone.heic', { type: 'image/heic' });

    const prepared = await prepareImageUpload(source, 'event');

    expect(prepared.type).toBe('image/jpeg');
    expect(putImageData).toHaveBeenCalledOnce();
    expect(terminate).toHaveBeenCalledOnce();
  });

  it('refuse une source supérieure à 20 Mo avant décodage', async () => {
    const source = new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'trop-lourde.jpg', { type: 'image/jpeg' });

    await expect(prepareImageUpload(source, 'event')).rejects.toThrow('20 Mo maximum');
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it('reconnaît un HEIC iPhone même lorsque le navigateur omet le type MIME', () => {
    expect(isSupportedImageUpload(new File(['heic'], 'IMG_0042.HEIC'))).toBe(true);
  });
});
