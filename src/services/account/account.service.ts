import 'server-only';

import { cookies } from 'next/headers';
import { storeRepository } from '@/repositories/store.repository';
import { userRepository } from '@/repositories/user.repository';
import { PROFILE_PROMPT_COOKIE, PROFILE_PROMPT_MAX_AGE_SECONDS } from './account.constants';
import { AccountError } from './account.error';
import type { UpdateProfileInput } from './account.types';
import { reserveStoreSlug } from './account.utils';

export const accountService = {
  async shouldPromptProfile(user: { phone: string | null; cityId: string | null }) {
    if (user.phone && user.cityId) return false;

    return (await cookies()).get(PROFILE_PROMPT_COOKIE)?.value !== 'done';
  },

  async dismissProfilePrompt() {
    (await cookies()).set(PROFILE_PROMPT_COOKIE, 'done', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: PROFILE_PROMPT_MAX_AGE_SECONDS,
      path: '/',
    });
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const displayName = input.displayName.trim();

    if (!displayName) throw new AccountError('Enter your name.');

    await userRepository.update(userId, {
      display_name: displayName,
      phone: input.phone.trim() || null,
      city_id: input.cityId || null,
    });
  },

  async openStore(userId: string, storeName: string) {
    const name = storeName.trim();

    if (!name) throw new AccountError('Enter a store name.');

    if (await storeRepository.findByUserId(userId)) {
      throw new AccountError('You already have a store.');
    }

    await storeRepository.insert({
      user_id: userId,
      name,
      slug: await reserveStoreSlug(name),
    });
  },
} as const;
