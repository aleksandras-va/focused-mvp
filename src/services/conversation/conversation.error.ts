import 'server-only';

import type { ConversationErrorCode } from './conversation.types';

export class ConversationError extends Error {
  constructor(readonly code: ConversationErrorCode) {
    super(code);
  }
}
