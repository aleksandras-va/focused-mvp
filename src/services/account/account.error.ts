import 'server-only';

import type { AccountErrorCode } from './account.types';

export class AccountError extends Error {
  constructor(readonly code: AccountErrorCode) {
    super(code);
  }
}
