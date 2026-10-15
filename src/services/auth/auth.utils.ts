import 'server-only';

import { storeRepository } from '@/repositories/store.repository';
import { MIN_PASSWORD_DISTINCT_CHARACTERS, MIN_PASSWORD_LENGTH } from './auth.constants';
import { AuthError } from './auth.error';
import type { AuthUser } from './auth.types';

export async function toAuthUser(row: {
  id: string;
  email: string;
  display_name: string;
  phone: string | null;
  city_id: string | null;
}): Promise<AuthUser> {
  const store = await storeRepository.findByUserId(row.id);

  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone,
    cityId: row.city_id,
    store: store ? { name: store.name, slug: store.slug } : null,
  };
}

export function assertStrongPassword(password: string, email: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError('password_too_short');
  }

  if (/^\d+$/.test(password)) {
    throw new AuthError('password_only_numbers');
  }

  if (new Set(password).size < MIN_PASSWORD_DISTINCT_CHARACTERS) {
    throw new AuthError('password_repetitive');
  }

  const emailName = email.split('@')[0];

  if (emailName.length >= 3 && password.toLowerCase().includes(emailName)) {
    throw new AuthError('password_contains_email');
  }
}
