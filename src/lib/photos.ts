export const MAX_PHOTOS = 12;

export const PHOTO_SIZES = { large: 2560, card: 800 } as const;
export type PhotoSize = keyof typeof PHOTO_SIZES;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const WEBP_QUALITY = 0.82;
const HEIC_JPEG_QUALITY = 0.92;
const HEIC_EXTENSIONS = ['heic', 'heif'];

export function isHeicFile(file: File) {
  const extension = file.name.toLowerCase().split('.').pop() ?? '';

  return HEIC_EXTENSIONS.includes(extension) || ['image/heic', 'image/heif'].includes(file.type);
}

export async function toDecodableImage(file: File): Promise<Blob> {
  if (!isHeicFile(file)) return file;

  try {
    (await createImageBitmap(file)).close();

    return file;
  } catch {
    const { heicTo } = await import('heic-to/next');

    return heicTo({ blob: file, type: 'image/jpeg', quality: HEIC_JPEG_QUALITY });
  }
}

export function photoObjectPath(storageKey: string, size: PhotoSize) {
  return `${storageKey}/${PHOTO_SIZES[size]}.webp`;
}

export async function compressToWebP(image: Blob, longEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not convert the image.'))),
      'image/webp',
      WEBP_QUALITY,
    );
  });
}
