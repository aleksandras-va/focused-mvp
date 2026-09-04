import Link from 'next/link';
import { ListingCard, type ListingCardItem } from '@/components/features/browse/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { BROWSE_SORTS, type BrowseFilters, hasActiveFilters } from '@/lib/browse-filters';
import { CATEGORY_LABELS, COSMETIC_CONDITIONS } from '@/lib/listing-options';
import type { ListingSummary } from '@/services/listing-service';

const shutterFormatter = new Intl.NumberFormat('en-IE');

type BrowseProps = {
  listings: ListingSummary[];
  filters: BrowseFilters;
  options: {
    brands: { slug: string; name: string }[];
    mounts: { slug: string; name: string }[];
  };
  modelName: string | null;
};

function toCardItem(listing: ListingSummary): ListingCardItem {
  const first = listing.items[0];
  const detail =
    first?.shutterCount !== null && first?.shutterCount !== undefined
      ? `${shutterFormatter.format(first.shutterCount)} shutter actuations`
      : (first?.mount ?? listing.location);

  return {
    id: listing.id,
    title: listing.title,
    subtitle: listing.isBundle ? `${listing.items.length} items` : (first?.brand ?? ''),
    detail,
    priceCents: listing.priceCents,
    condition: first?.cosmeticCondition ?? '',
    imageUrl: listing.photos[0]?.cardUrl ?? null,
    isBundle: listing.isBundle,
  };
}

export function Browse({ listings, filters, options, modelName }: BrowseProps) {
  const cents = (value: number | null) => (value === null ? '' : String(value / 100));

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Used cameras and lenses
        </h1>
        <p className="text-muted-foreground">
          Every listing is tied to a real model, so specs and search actually work.
        </p>
      </div>

      <form method="get" action="/" className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {filters.model ? <input type="hidden" name="model" value={filters.model} /> : null}

        <FilterField label="Category">
          <NativeSelect name="category" defaultValue={filters.category ?? ''}>
            <NativeSelectOption value="">All</NativeSelectOption>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <NativeSelectOption key={value} value={value}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>

        <FilterField label="Brand">
          <NativeSelect name="brand" defaultValue={filters.brand ?? ''}>
            <NativeSelectOption value="">All</NativeSelectOption>
            {options.brands.map((brand) => (
              <NativeSelectOption key={brand.slug} value={brand.slug}>
                {brand.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>

        <FilterField label="Mount">
          <NativeSelect name="mount" defaultValue={filters.mount ?? ''}>
            <NativeSelectOption value="">All</NativeSelectOption>
            {options.mounts.map((mount) => (
              <NativeSelectOption key={mount.slug} value={mount.slug}>
                {mount.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>

        <FilterField label="Min price">
          <Input
            name="min"
            type="number"
            min="0"
            step="1"
            defaultValue={cents(filters.minPriceCents)}
          />
        </FilterField>

        <FilterField label="Max price">
          <Input
            name="max"
            type="number"
            min="0"
            step="1"
            defaultValue={cents(filters.maxPriceCents)}
          />
        </FilterField>

        <FilterField label="Condition">
          <NativeSelect name="condition" defaultValue={filters.cosmeticCondition ?? ''}>
            <NativeSelectOption value="">Any</NativeSelectOption>
            {COSMETIC_CONDITIONS.map((condition) => (
              <NativeSelectOption key={condition.value} value={condition.value}>
                {condition.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>

        <FilterField label="Sort">
          <NativeSelect name="sort" defaultValue={filters.sort}>
            {BROWSE_SORTS.map((sort) => (
              <NativeSelectOption key={sort.value} value={sort.value}>
                {sort.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FilterField>

        <div className="flex items-end gap-2 sm:col-span-3 lg:col-span-7">
          <Button type="submit">Apply</Button>
          {hasActiveFilters(filters) ? (
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Clear filters
            </Link>
          ) : null}
          {modelName ? (
            <Badge variant="secondary" className="ml-auto">
              Model: {modelName}
            </Badge>
          ) : null}
        </div>
      </form>

      {listings.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">No listings match</p>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters(filters)
              ? 'Try fewer filters, or check back later.'
              : 'Nothing has been listed yet — be the first.'}
          </p>
          {hasActiveFilters(filters) ? (
            <Link href="/" className="text-sm underline">
              Clear filters
            </Link>
          ) : (
            <Link href="/sell" className="text-sm underline">
              Sell gear
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} item={toCardItem(listing)} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col items-start gap-1.5 text-xs text-muted-foreground">
      {label}
      {children}
    </Label>
  );
}
