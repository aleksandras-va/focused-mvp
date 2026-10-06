import { BundleItemCard } from '@/components/features/listings/info/bundle-item-card';
import { IncludedList } from '@/components/features/listings/info/included-list';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingBodyProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
}

export function ListingBody({ listing, focusedItem }: ListingBodyProps) {
  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? listing.items[0] ?? null;

  return (
    <div className="flex flex-col gap-10">
      {isBundleOverview ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-[1.375rem] font-bold">In this bundle</h2>
            <span className="text-sm text-muted-foreground">{listing.items.length} items</span>
          </div>
          {listing.items.map((bundleItem) => (
            <BundleItemCard key={bundleItem.id} item={bundleItem} />
          ))}
        </section>
      ) : null}

      {listing.description ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-[1.375rem] font-bold">From the seller</h2>
          <p className="max-w-2xl text-base leading-relaxed whitespace-pre-line text-foreground/85">
            {listing.description}
          </p>
        </section>
      ) : null}

      {!isBundleOverview && item ? <IncludedList item={item} /> : null}
    </div>
  );
}
