import 'server-only';
import { AwsClient } from 'aws4fetch';
import { type PhotoSize, photoObjectPath } from '@/lib/photos';

const UPLOAD_URL_EXPIRES_SECONDS = 600;

export class PhotoStorageError extends Error {}

function storageConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new PhotoStorageError('Photo storage is not configured.');
  }

  const jurisdiction = process.env.R2_JURISDICTION;
  const host = jurisdiction
    ? `${accountId}.${jurisdiction}.r2.cloudflarestorage.com`
    : `${accountId}.r2.cloudflarestorage.com`;

  return {
    bucket,
    host,
    client: new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' }),
  };
}

export type PhotoUpload = {
  storageKey: string;
  uploadUrls: { large: string; card: string };
};

export async function createPhotoUpload(): Promise<PhotoUpload> {
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
}

export function publicPhotoUrl(storageKey: string, size: PhotoSize): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  return base ? `${base}/${photoObjectPath(storageKey, size)}` : null;
}
