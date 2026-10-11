import 'server-only';

import type { ModelCategory } from '@/db/types';
import { CATEGORY_LABELS, CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';

type TitleItem = {
  name: string;
  category: ModelCategory | null;
};

const FULL_NAMES_LIMIT = 2;
const UNTITLED = 'Untitled draft';
const SEPARATOR = ' + ';
const countedCategories: ModelCategory[] = ['camera', 'lens', 'accessory'];

export const listingTitleResolver = {
  resolve(items: TitleItem[]) {
    if (items.length === 0) return UNTITLED;
    if (items.length <= FULL_NAMES_LIMIT) return items.map((item) => item.name).join(SEPARATOR);

    const lead = items.find((item) => item.category === 'camera') ?? items[0];
    const rest = items.filter((item) => item !== lead);

    return [lead.name, ...countedCategories.flatMap((category) => countLabel(rest, category))].join(
      SEPARATOR,
    );
  },
} as const;

function countLabel(items: TitleItem[], category: ModelCategory) {
  const count = items.filter((item) => item.category === category).length;

  if (count === 0) return [];

  const label = count === 1 ? CATEGORY_LABELS[category] : CATEGORY_PLURAL_LABELS[category];

  return [`${count} ${label.toLowerCase()}`];
}
