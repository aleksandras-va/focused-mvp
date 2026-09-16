import 'server-only';

import { storeRepository } from '@/repositories/store.repository';
import { userRepository } from '@/repositories/user.repository';
import { AccountError } from './account.error';
import type { UpdateProfileInput } from './account.types';
import { reserveStoreSlug } from './account.utils';

export const accountService = {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const displayName = input.displayName.trim();

    if (!displayName) throw new AccountError('Enter your name.');

    await userRepository.update(userId, {
      display_name: displayName,
      phone: input.phone.trim() || null,
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
