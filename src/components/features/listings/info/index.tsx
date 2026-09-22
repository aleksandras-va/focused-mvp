import { ListingBreadcrumbs } from '@/components/features/listings/info/breadcrumbs';
import { BundleNotice } from '@/components/features/listings/info/bundle-notice';
import { DetailRow } from '@/components/features/listings/info/detail-row';
import { ListingItemCard } from '@/components/features/listings/info/item-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatOptionalPrice } from '@/lib/format';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingInfoProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
}

export function ListingInfo({ listing, focusedItem }: ListingInfoProps) {
  const title = focusedItem?.modelName ?? listing.title;
  const priceCents = focusedItem?.priceCents ?? listing.priceCents;
  const shownItems = focusedItem ? [focusedItem] : listing.items;
  const isBundleOverview = listing.isBundle && !focusedItem;
  const breadcrumbItem = isBundleOverview ? null : (focusedItem ?? listing.items[0] ?? null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ListingBreadcrumbs item={breadcrumbItem} />
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="font-heading text-2xl font-semibold">{formatOptionalPrice(priceCents)}</p>
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

      {shownItems.map((item) => (
        <ListingItemCard key={item.id} item={item} inBundleOverview={isBundleOverview} />
      ))}

      <Card>
        <CardContent className="flex flex-col gap-3 text-sm">
          <DetailRow label="City" value={listing.city ?? 'Not set'} />
          <Separator />
          <DetailRow
            label="Seller"
            value={listing.seller.storeName ?? listing.seller.name}
            badge={listing.seller.isStore ? 'Store' : null}
          />
        </CardContent>
      </Card>

      {listing.description ? (
        <Card>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="text-base whitespace-pre-line text-gray-800">{listing.description}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
