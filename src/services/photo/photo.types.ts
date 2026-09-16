import 'server-only';

export interface PhotoUpload {
  storageKey: string;
  uploadUrls: { large: string; card: string };
}
