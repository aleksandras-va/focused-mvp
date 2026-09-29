import { ListingBreadcrumbs } from '@/components/features/listings/info/breadcrumbs';
import { BundleNotice } from '@/components/features/listings/info/bundle-notice';
import { ListingItemCard } from '@/components/features/listings/info/item-card';
import { SellerCard } from '@/components/features/listings/info/seller-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatOptionalPrice } from '@/lib/format';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingInfoProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
}

export function ListingInfo({ listing, focusedItem, isSignedIn }: ListingInfoProps) {
  const title = focusedItem?.modelName ?? listing.title;
  const priceCents = focusedItem?.priceCents ?? listing.priceCents;
  const shownItems = focusedItem ? [focusedItem] : listing.items;
  const isBundleOverview = listing.isBundle && !focusedItem;
  const breadcrumbItem = isBundleOverview ? null : (focusedItem ?? listing.items[0] ?? null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <ListingBreadcrumbs item={breadcrumbItem} />
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
        <p className="text-2xl font-semibold">{formatOptionalPrice(priceCents)}</p>
        {listing.status !== 'active' ? (
          <Badge variant="outline" className="w-fit capitalize">
            {listing.status}
          </Badge>
        ) : null}
      </div>

      {focusedItem && listing.isBundle ? (
        <BundleNotice
          bundleId={listing.id}
          bundleTitle={listing.title}
          soldSeparately={focusedItem.soldSeparately}
        />
      ) : null}

      <SellerCard
        seller={listing.seller}
        phone={listing.contact.phone}
        city={listing.city}
        isSignedIn={isSignedIn}
      />

      {shownItems.map((item) => (
        <ListingItemCard key={item.id} item={item} inBundleOverview={isBundleOverview} />
      ))}

      {listing.description ? (
        <Card>
          <CardContent>
            <p className="text-base whitespace-pre-line">{listing.description}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
