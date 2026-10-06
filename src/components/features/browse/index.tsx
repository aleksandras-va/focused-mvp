import { SearchXIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { AutoSubmitForm } from '@/components/features/browse/auto-submit-form';
import { FeaturedBreak, type FeaturedPhoto } from '@/components/features/browse/featured-break';
import { FilterPopover } from '@/components/features/browse/filter-popover';
import { ListingFeed } from '@/components/features/browse/listing-feed';
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
import { CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';
import type { ListingSummary } from '@/services/listing/listing.types';

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
  featuredPhoto: FeaturedPhoto;
};

const categories: ModelCategory[] = ['camera', 'lens', 'accessory'];

const categoryLinks: { category: ModelCategory | null; label: string }[] = [
  { category: null, label: 'All' },
  ...categories.map((category) => ({ category, label: CATEGORY_PLURAL_LABELS[category] })),
];

export function Browse({
  listings,
  hasMore,
  page,
  filters,
  options,
  modelName,
  featuredPhoto,
}: BrowseProps) {
  return (
    <div className="flex flex-col gap-6 pt-header-expansion">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
          Second-hand camera gear
        </h1>
        <p className="text-muted-foreground">From people who actually shot with it.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {categoryLinks.map(({ category, label }) => (
            <Link
              key={label}
              href={browseHref(filters, { category })}
              aria-current={filters.category === category ? 'page' : undefined}
              className={cn(
                'flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors',
                filters.category === category
                  ? 'bg-foreground text-background'
                  : 'text-foreground/75 hover:bg-muted hover:text-foreground',
              )}
            >
              {label}
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
              aria-label="Sort"
              defaultValue={filters.sort}
              className="[&>select]:rounded-full [&>select]:border-border [&>select]:hover:bg-muted"
            >
              {BROWSE_SORTS.map((sort) => (
                <NativeSelectOption key={sort.value} value={sort.value}>
                  {sort.label}
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

      {listings.length === 0 ? (
        <EmptyState
          icon={<SearchXIcon className="text-primary" />}
          title={hasActiveFilters(filters) ? 'No listings match' : 'Nothing listed yet'}
          description={
            hasActiveFilters(filters)
              ? 'Try fewer filters, or check back later.'
              : 'Be the first to list something.'
          }
        >
          {hasActiveFilters(filters) ? (
            <Link href="/" className={buttonVariants({ variant: 'outline' })}>
              Clear filters
            </Link>
          ) : (
            <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
              Sell gear
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
            Load more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
