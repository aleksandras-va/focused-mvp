import type { useTranslations } from 'next-intl';
import type { ModelCategory } from '@/db/tables';

export interface ListingTitle {
  names: string[];
  counts: { category: ModelCategory; count: number }[];
}

type ListingTitleTranslator = ReturnType<typeof useTranslations<'listingTitle'>>;

type TitleItem = {
  name: string;
  category: ModelCategory | null;
};

const SEPARATOR = ' + ';
const FULL_NAMES_LIMIT = 2;
const COUNTED_CATEGORIES: ModelCategory[] = ['camera', 'lens', 'accessory'];

export function resolveListingTitle(items: TitleItem[]): ListingTitle {
  if (items.length <= FULL_NAMES_LIMIT) {
    return { names: items.map((item) => item.name), counts: [] };
  }

  const lead = items.find((item) => item.category === 'camera') ?? items[0];
  const rest = items.filter((item) => item !== lead);

  return {
    names: [lead.name],
    counts: COUNTED_CATEGORIES.map((category) => ({
      category,
      count: rest.filter((item) => item.category === category).length,
    })).filter(({ count }) => count > 0),
  };
}

export function formatListingTitle(title: ListingTitle, t: ListingTitleTranslator): string {
  if (title.names.length === 0) return t('untitled');

  return [
    ...title.names,
    ...title.counts.map(({ category, count }) => t('count', { category, count })),
  ].join(SEPARATOR);
}
