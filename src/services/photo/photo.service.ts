import 'server-only';

import { after } from 'next/server';
import { PHOTO_SIZES, type PhotoSize, photoObjectPath } from '@/lib/photos';
import { UPLOAD_URL_EXPIRES_SECONDS } from './photo.constants';
import { PhotoStorageError } from './photo.error';
import type { PhotoUpload } from './photo.types';
import { storageConfig } from './photo.utils';

export const photoService = {
  getPublicUrl(storageKey: string, size: PhotoSize): string | null {
    const base = process.env.R2_PUBLIC_BASE_URL;

    return base ? `${base}/${photoObjectPath(storageKey, size)}` : null;
  },

  getPublicOrigin(): string | null {
    const base = process.env.R2_PUBLIC_BASE_URL;

    return base ? new URL(base).origin : null;
  },

  async createUpload(): Promise<PhotoUpload> {
    const { bucket, host, client } = storageConfig();
    const storageKey = `photos/${crypto.randomUUID()}`;

    async function presign(size: PhotoSize) {
      const url = new URL(`https://${host}/${bucket}/${photoObjectPath(storageKey, size)}`);

      url.searchParams.set('X-Amz-Expires', String(UPLOAD_URL_EXPIRES_SECONDS));

      const signed = await client.sign(new Request(url, { method: 'PUT' }), {
        aws: { signQuery: true },
      });

      return signed.url;
    }

    return {
      storageKey,
      uploadUrls: { large: await presign('large'), card: await presign('card') },
    };
  },

  deleteStored(storageKeys: string[]) {
    if (storageKeys.length === 0) return;

    after(() =>
      deleteObjects(storageKeys).catch((error) => {
        console.error('Deleting photos from storage failed', storageKeys, error);
      }),
    );
  },
} as const;

async function deleteObjects(storageKeys: string[]) {
  const { bucket, host, client } = storageConfig();
  const sizes = Object.keys(PHOTO_SIZES) as PhotoSize[];
  const paths = storageKeys.flatMap((key) => sizes.map((size) => photoObjectPath(key, size)));

  const responses = await Promise.all(
    paths.map((path) => client.fetch(`https://${host}/${bucket}/${path}`, { method: 'DELETE' })),
  );
  const failed = responses.filter((response) => !response.ok && response.status !== 404);

  if (failed.length > 0) {
    throw new PhotoStorageError(`Storage rejected ${failed.length} of ${paths.length} deletes.`);
  }
}
