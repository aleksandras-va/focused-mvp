import 'server-only';

import type { ListingErrorCode } from './listing.types';

export class ListingError extends Error {
  constructor(readonly code: ListingErrorCode) {
    super(code);
  }
}
