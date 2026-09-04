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

export function photoObjectPath(storageKey: string, size: PhotoSize) {
  return `${storageKey}/${PHOTO_SIZES[size]}.webp`;
}

export async function compressToWebP(file: File, longEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
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
