'use client';

import { preconnect } from 'react-dom';

export function Preconnect({ origin }: { origin: string | null }) {
  if (origin) preconnect(origin);

  return null;
}
