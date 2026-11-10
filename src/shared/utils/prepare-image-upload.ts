const SOURCE_IMAGE_MAX_BYTES = 20 * 1024 * 1024;
const SOURCE_IMAGE_MAX_PIXELS = 50_000_000;
const HEIC_TIMEOUT_MS = 15_000;

const IMAGE_POLICIES = {
  user: { maxBytes: 500 * 1024, maxDimension: 1200 },
  animal: { maxBytes: 500 * 1024, maxDimension: 1200 },
  body: { maxBytes: 1024 * 1024, maxDimension: 1600 },
  wish: { maxBytes: 750 * 1024, maxDimension: 1600 },
  event: { maxBytes: 3 * 1024 * 1024, maxDimension: 2000 },
} as const;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
]);
const JPEG_QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42];

export type ImageUploadResource = keyof typeof IMAGE_POLICIES;

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

type HeicWorkerResponse = {
  id: string;
  ok: boolean;
  width?: number;
  height?: number;
  pixels?: ArrayBuffer;
  message?: string;
};

let preparationQueue = Promise.resolve();

export function prepareImageUpload(file: File, resource: ImageUploadResource): Promise<File> {
  const preparation = preparationQueue.then(() => prepareImageUploadNow(file, resource));
  preparationQueue = preparation.then(() => undefined, () => undefined);
  return preparation;
}

export function isSupportedImageUpload(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.has(file.type) || /\.(?:jpe?g|png|webp|heic|heif|avif)$/i.test(file.name);
}

async function prepareImageUploadNow(file: File, resource: ImageUploadResource): Promise<File> {
  if (!isSupportedImageUpload(file) || file.size < 1 || file.size > SOURCE_IMAGE_MAX_BYTES) {
    throw new Error('La photo doit être une image compatible de 20 Mo maximum.');
  }

  const policy = IMAGE_POLICIES[resource];
  const decoded = isHeic(file) ? await decodeHeic(file) : await decodeBrowserImage(file);
  try {
    if (decoded.width * decoded.height > SOURCE_IMAGE_MAX_PIXELS) {
      throw new Error('La définition de cette photo est trop élevée.');
    }
    let scale = Math.min(1, policy.maxDimension / Math.max(decoded.width, decoded.height));
    for (let resizeAttempt = 0; resizeAttempt < 6; resizeAttempt += 1) {
      const width = Math.max(1, Math.round(decoded.width * scale));
      const height = Math.max(1, Math.round(decoded.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('La compression de cette image n’est pas disponible dans ce navigateur.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(decoded.source, 0, 0, width, height);

      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToBlob(canvas, quality);
        if (blob.size <= policy.maxBytes) {
          return new File([blob], jpegFilename(file.name), { type: 'image/jpeg', lastModified: file.lastModified });
        }
      }
      scale *= 0.82;
    }
  } finally {
    decoded.close();
  }
  throw new Error('La photo reste trop volumineuse après compression.');
}

async function decodeHeic(file: File): Promise<DecodedImage> {
  const id = crypto.randomUUID();
  const worker = new Worker('/workers/heic-decoder.worker.js', { type: 'module', name: 'vasco-heic-decoder' });
  try {
    const buffer = await readBlobAsArrayBuffer(file);
    const response = await new Promise<HeicWorkerResponse>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('La conversion HEIC a dépassé le délai autorisé.')), HEIC_TIMEOUT_MS);
      worker.onmessage = ({ data }: MessageEvent<HeicWorkerResponse>) => {
        if (data.id !== id) return;
        window.clearTimeout(timeout);
        resolve(data);
      };
      worker.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('La conversion HEIC a échoué.'));
      };
      worker.postMessage({ id, buffer }, [buffer]);
    });
    if (!response.ok || !response.pixels || !response.width || !response.height) {
      throw new Error(response.message || 'La photo HEIC/HEIF n’a pas pu être convertie.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = response.width;
    canvas.height = response.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('La conversion HEIC n’est pas disponible dans ce navigateur.');
    context.putImageData(
      new ImageData(new Uint8ClampedArray(response.pixels), response.width, response.height),
      0,
      0,
    );
    return { source: canvas, width: response.width, height: response.height, close: () => undefined };
  } finally {
    worker.terminate();
  }
}

function readBlobAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => reader.result instanceof ArrayBuffer
      ? resolve(reader.result)
      : reject(new Error('Lecture de la photo impossible.'));
    reader.onerror = () => reject(reader.error ?? new Error('Lecture de la photo impossible.'));
    reader.readAsArrayBuffer(blob);
  });
}

async function decodeBrowserImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch (error) {
      throw new Error('Le navigateur ne peut pas décoder cette image.', { cause: error });
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Le navigateur ne peut pas décoder cette image.'));
      element.src = objectUrl;
    });
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('La compression JPEG a échoué.'));
    }, 'image/jpeg', quality);
  });
}

function isHeic(file: File): boolean {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.(?:heic|heif)$/i.test(file.name);
}

function jpegFilename(filename: string): string {
  return `${filename.replace(/\.[^.]+$/, '') || 'photo'}.jpg`;
}
