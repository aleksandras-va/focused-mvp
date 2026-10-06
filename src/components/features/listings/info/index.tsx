import { ListingBreadcrumbs } from '@/components/features/listings/info/breadcrumbs';
import { BundleNotice } from '@/components/features/listings/info/bundle-notice';
import { BundlePriceList } from '@/components/features/listings/info/bundle-price-list';
import { ContactActions } from '@/components/features/listings/info/contact-actions';
import { FactTiles } from '@/components/features/listings/info/fact-tiles';
import { SafetyNote } from '@/components/features/listings/info/safety-note';
import { SellerCard } from '@/components/features/listings/info/seller-card';
import { Badge } from '@/components/ui/badge';
import { formatOptionalPrice } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingInfoProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
}

export function ListingInfo({ listing, focusedItem, isSignedIn }: ListingInfoProps) {
  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? (isBundleOverview ? null : (listing.items[0] ?? null));
  const title = item?.modelName ?? listing.title;
  const priceCents = item?.priceCents ?? listing.priceCents;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <ListingBreadcrumbs item={item} />
        {isBundleOverview ? (
          <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-ink">
            Bundle · {listing.items.length} items
          </span>
        ) : null}
        <h1
          className={
            isBundleOverview
              ? 'font-heading text-3xl leading-tight font-extrabold text-balance'
              : 'font-heading text-3xl leading-tight font-extrabold text-balance sm:text-4xl'
          }
        >
          {title}
        </h1>
        {item ? (
          <p className="text-muted-foreground">
            {[CATEGORY_LABELS[item.category], item.mount].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="text-3xl font-bold tracking-tight">{formatOptionalPrice(priceCents)}</p>
        {isBundleOverview ? (
          <p className="text-sm text-muted-foreground">for all {listing.items.length}</p>
        ) : null}
        {listing.status !== 'active' ? (
          <Badge variant="outline" className="mt-2 w-fit capitalize">
            {listing.status}
          </Badge>
        ) : null}
      </div>

      {item ? <FactTiles item={item} /> : <BundlePriceList items={listing.items} />}

      {focusedItem && listing.isBundle ? (
        <BundleNotice
          bundleId={listing.id}
          bundleTitle={listing.title}
          soldSeparately={focusedItem.soldSeparately}
        />
      ) : null}

      <ContactActions phone={listing.contact.phone} isSignedIn={isSignedIn} />
      <SellerCard seller={listing.seller} city={listing.city} />
      <SafetyNote />
    </div>
  );
}
