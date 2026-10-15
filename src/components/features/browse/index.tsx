import { SearchXIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AutoSubmitForm } from '@/components/features/browse/auto-submit-form';
import { FeaturedBreak, type FeaturedPhoto } from '@/components/features/browse/featured-break';
import { FilterPopover } from '@/components/features/browse/filter-popover';
import { ListingFeed } from '@/components/features/browse/listing-feed';
import { ModelUnavailable } from '@/components/features/browse/model-unavailable';
import { SellBreak } from '@/components/features/browse/sell-break';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { ModelCategory } from '@/db/tables';
import {
  BROWSE_SORTS,
  type BrowseFilters,
  browseHref,
  browseParams,
  hasActiveFilters,
} from '@/lib/browse-filters';
import { cn } from '@/lib/utils';
import type { ListingSummary, SimilarListings } from '@/services/listing/listing.types';

type BrowseProps = {
  listings: ListingSummary[];
  hasMore: boolean;
  page: number;
  filters: BrowseFilters;
  options: {
    brands: { slug: string; name: string }[];
    mounts: { slug: string; name: string }[];
  };
  modelName: string | null;
  similar: SimilarListings | null;
  featuredPhoto: FeaturedPhoto;
};

const categories: (ModelCategory | null)[] = [null, 'camera', 'lens', 'accessory'];

export function Browse({
  listings,
  hasMore,
  page,
  filters,
  options,
  modelName,
  similar,
  featuredPhoto,
}: BrowseProps) {
  const t = useTranslations('browse');
  const tEnums = useTranslations('enums');
  const tCommon = useTranslations('common');
  const filtered = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-6 pt-header-expansion">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {categories.map((category) => (
            <Link
              key={category ?? 'all'}
              href={browseHref(filters, { category })}
              aria-current={filters.category === category ? 'page' : undefined}
              className={cn(
                'flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors',
                filters.category === category
                  ? 'bg-foreground text-background'
                  : 'text-foreground/75 hover:bg-muted hover:text-foreground',
              )}
            >
              {category ? tEnums(`categoryPlural.${category}`) : t('all')}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <FilterPopover filters={filters} options={options} />

          <AutoSubmitForm>
            {browseParams(filters)
              .filter(([name]) => name !== 'sort')
              .map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
            <NativeSelect
              name="sort"
              aria-label={t('sort')}
              defaultValue={filters.sort}
              className="[&>select]:rounded-full [&>select]:border-border [&>select]:hover:bg-muted"
            >
              {BROWSE_SORTS.map((sort) => (
                <NativeSelectOption key={sort} value={sort}>
                  {t(`sorts.${sort}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </AutoSubmitForm>
        </div>
      </div>

      {modelName ? (
        <div className="flex">
          <Link
            href={browseHref(filters, { model: null })}
            className="flex h-9 items-center gap-1.5 rounded-full bg-accent pr-2.5 pl-3.5 text-sm font-medium text-accent-foreground"
          >
            {modelName}
            <XIcon className="size-4" />
          </Link>
        </div>
      ) : null}

      {modelName && similar ? (
        <ModelUnavailable modelName={modelName} similar={similar} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<SearchXIcon className="text-primary" />}
          title={filtered ? t('noMatches') : t('empty')}
          description={filtered ? t('noMatchesHint') : t('emptyHint')}
        >
          {filtered ? (
            <Link href="/" className={buttonVariants({ variant: 'outline' })}>
              {t('clearFilters')}
            </Link>
          ) : (
            <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
              {tCommon('sellGear')}
            </Link>
          )}
        </EmptyState>
      ) : (
        <ListingFeed
          listings={listings}
          breaks={[
            <FeaturedBreak key="featured" photo={featuredPhoto} />,
            <SellBreak key="sell" />,
          ]}
        />
      )}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Link
            href={browseHref(filters, {}, page + 1)}
            scroll={false}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            {t('loadMore')}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
