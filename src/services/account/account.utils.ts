import 'server-only';

import { storeRepository } from '@/repositories/store.repository';
import { AccountError } from './account.error';

export async function reserveStoreSlug(storeName: string) {
  const base = slugify(storeName);

  if (!base) throw new AccountError('Store name needs at least one letter or number.');

  let candidate = base;
  let suffix = 2;

  while (await storeRepository.slugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
