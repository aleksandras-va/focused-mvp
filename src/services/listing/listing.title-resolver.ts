import 'server-only';

import type { ModelCategory } from '@/db/types';
import type { ListingTitle } from '@/lib/listing-title';

type TitleItem = {
  name: string;
  category: ModelCategory | null;
};

const FULL_NAMES_LIMIT = 2;
const countedCategories: ModelCategory[] = ['camera', 'lens', 'accessory'];

export const listingTitleResolver = {
  resolve(items: TitleItem[]): ListingTitle {
    if (items.length <= FULL_NAMES_LIMIT) {
      return { names: items.map((item) => item.name), counts: [] };
    }

    const lead = items.find((item) => item.category === 'camera') ?? items[0];
    const rest = items.filter((item) => item !== lead);

    return {
      names: [lead.name],
      counts: countedCategories
        .map((category) => ({
          category,
          count: rest.filter((item) => item.category === category).length,
        }))
        .filter(({ count }) => count > 0),
    };
  },
} as const;
