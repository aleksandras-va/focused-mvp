import 'server-only';

export type AccountErrorCode =
  | 'missing_name'
  | 'missing_store_name'
  | 'store_exists'
  | 'invalid_store_name';

export interface UpdateProfileInput {
  displayName: string;
  phone: string;
  cityId: string;
}
