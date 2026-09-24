import 'server-only';

import { userRepository } from '@/repositories/user.repository';
import { USER_ID_PATTERN } from './seller.constants';
import type { SellerProfile } from './seller.types';

export const sellerService = {
  async getProfile(id: string): Promise<SellerProfile | null> {
    if (!USER_ID_PATTERN.test(id)) return null;

    const row = await userRepository.findSellerProfile(id);

    if (!row) return null;

    return {
      id: row.id,
      name: row.store_name ?? row.display_name,
      isStore: row.store_name !== null,
      city: row.city_name,
      memberSince: row.created_at,
    };
  },
} as const;
