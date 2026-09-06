import 'server-only';

import { type PhotoSize, photoObjectPath } from '@/lib/photos';
import { UPLOAD_URL_EXPIRES_SECONDS } from './photo.constants';
import { storageConfig } from './photo.utils';

export interface PhotoUpload {
  storageKey: string;
  uploadUrls: { large: string; card: string };
}

export const photoService = {
  getPublicUrl(storageKey: string, size: PhotoSize): string | null {
    const base = process.env.R2_PUBLIC_BASE_URL;

    return base ? `${base}/${photoObjectPath(storageKey, size)}` : null;
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
} as const;
