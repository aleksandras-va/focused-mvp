import { SearchXIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { FilterForm } from '@/components/features/browse/filter-form';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { PillLink } from '@/components/ui/pill-link';
import type { ModelCategory } from '@/db/tables';
import {
  BROWSE_SORTS,
  type BrowseFilters,
  browseHref,
  hasActiveFilters,
} from '@/lib/browse-filters';
import { CATEGORY_PLURAL_LABELS, COSMETIC_CONDITIONS } from '@/lib/listing-options';
import type { ListingSummary } from '@/services/listing/listing.types';

type BrowseProps = {
  listings: ListingSummary[];
  filters: BrowseFilters;
  options: {
    brands: { slug: string; name: string }[];
    mounts: { slug: string; name: string }[];
  };
  modelName: string | null;
};

const categories: ModelCategory[] = ['camera', 'lens', 'accessory'];

const pillSelectClass =
  '[&>select]:rounded-full [&>select]:border-border [&>select]:hover:bg-muted';

const priceInputClass =
  'w-14 bg-transparent text-sm outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export function Browse({ listings, filters, options, modelName }: BrowseProps) {
  const euros = (value: number | null) => (value === null ? '' : String(value / 100));
  const heading = filters.category ? CATEGORY_PLURAL_LABELS[filters.category] : 'All items';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{heading}</h1>
        <p className="text-muted-foreground">
          {listings.length === 1 ? '1 item' : `${listings.length} items`}
        </p>
      </div>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <PillLink
          href={browseHref(filters, { category: null })}
          isActive={filters.category === null}
        >
          All
        </PillLink>
        {categories.map((category) => (
          <PillLink
            key={category}
            href={browseHref(filters, { category })}
            isActive={filters.category === category}
          >
            {CATEGORY_PLURAL_LABELS[category]}
          </PillLink>
        ))}
      </nav>

      <FilterForm>
        {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
        {filters.model ? <input type="hidden" name="model" value={filters.model} /> : null}

        <NativeSelect
          name="brand"
          aria-label="Brand"
          defaultValue={filters.brand ?? ''}
          className={pillSelectClass}
        >
          <NativeSelectOption value="">All brands</NativeSelectOption>
          {options.brands.map((brand) => (
            <NativeSelectOption key={brand.slug} value={brand.slug}>
              {brand.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          name="mount"
          aria-label="Mount"
          defaultValue={filters.mount ?? ''}
          className={pillSelectClass}
        >
          <NativeSelectOption value="">All mounts</NativeSelectOption>
          {options.mounts.map((mount) => (
            <NativeSelectOption key={mount.slug} value={mount.slug}>
              {mount.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          name="condition"
          aria-label="Condition"
          defaultValue={filters.cosmeticCondition ?? ''}
          className={pillSelectClass}
        >
          <NativeSelectOption value="">Any condition</NativeSelectOption>
          {COSMETIC_CONDITIONS.map((condition) => (
            <NativeSelectOption key={condition.value} value={condition.value}>
              {condition.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <div className="flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm">
          <span className="text-muted-foreground">€</span>
          <input
            name="min"
            type="number"
            min="0"
            step="1"
            placeholder="Min"
            aria-label="Minimum price"
            defaultValue={euros(filters.minPriceCents)}
            className={priceInputClass}
          />
          <span className="text-muted-foreground">–</span>
          <input
            name="max"
            type="number"
            min="0"
            step="1"
            placeholder="Max"
            aria-label="Maximum price"
            defaultValue={euros(filters.maxPriceCents)}
            className={priceInputClass}
          />
        </div>

        {modelName ? (
          <Link
            href={browseHref(filters, { model: null })}
            className="flex h-10 items-center gap-1.5 rounded-full bg-accent pr-2.5 pl-3.5 text-sm font-medium text-accent-foreground"
          >
            {modelName}
            <XIcon className="size-4" />
          </Link>
        ) : null}

        {hasActiveFilters(filters) ? (
          <Link href="/items" className="px-2 text-sm text-muted-foreground hover:text-foreground">
            Clear
          </Link>
        ) : null}

        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <label htmlFor="browse-sort">Sort</label>
          <NativeSelect
            id="browse-sort"
            name="sort"
            defaultValue={filters.sort}
            className={pillSelectClass}
          >
            {BROWSE_SORTS.map((sort) => (
              <NativeSelectOption key={sort.value} value={sort.value}>
                {sort.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </FilterForm>

      {listings.length === 0 ? (
        <EmptyState
          icon={<SearchXIcon />}
          title={hasActiveFilters(filters) ? 'No listings match' : 'Nothing listed yet'}
          description={
            hasActiveFilters(filters)
              ? 'Try fewer filters, or check back later.'
              : 'Be the first to list something.'
          }
        >
          {hasActiveFilters(filters) ? (
            <Link href="/items" className={buttonVariants({ variant: 'outline' })}>
              Clear filters
            </Link>
          ) : (
            <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
              Sell gear
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} item={toListingCardItem(listing)} />
          ))}
        </div>
      )}
    </div>
  );
}
