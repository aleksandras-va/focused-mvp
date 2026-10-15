import 'server-only';

import type { AuthErrorCode } from './auth.types';

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
  }
}
