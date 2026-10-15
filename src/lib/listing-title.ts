import type { useTranslations } from 'next-intl';
import type { ModelCategory } from '@/db/tables';

export interface ListingTitle {
  names: string[];
  counts: { category: ModelCategory; count: number }[];
}

type ListingTitleTranslator = ReturnType<typeof useTranslations<'listingTitle'>>;

const SEPARATOR = ' + ';

export function formatListingTitle(title: ListingTitle, t: ListingTitleTranslator): string {
  if (title.names.length === 0) return t('untitled');

  return [
    ...title.names,
    ...title.counts.map(({ category, count }) => t('count', { category, count })),
  ].join(SEPARATOR);
}
