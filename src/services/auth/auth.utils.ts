import { storeRepository } from '@/repositories/store.repository';
import { AuthError } from './auth.error';
import type { AuthUser } from './auth.types';

export async function toAuthUser(row: {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
}): Promise<AuthUser> {
  const store = await storeRepository.findByUserId(row.id);

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone,
    store: store ? { name: store.name, slug: store.slug } : null,
  };
}

export async function reserveStoreSlug(storeName: string) {
  const base = slugify(storeName);
  if (!base) throw new AuthError('Invalid store name.');

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
