import { AwsClient } from 'aws4fetch';
import { PhotoStorageError } from './photo.error';

export function storageConfig() {
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
