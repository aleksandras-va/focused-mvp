import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { Badge } from '@/components/ui/badge';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { formatMonth } from '@/lib/format';
import type { ListingSummary } from '@/services/listing/listing.types';
import type { SellerProfile as Seller } from '@/services/seller/seller.types';

interface SellerProfileProps {
  seller: Seller;
  listings: ListingSummary[];
}

export function SellerProfile({ seller, listings }: SellerProfileProps) {
  const facts = [seller.city, `Member since ${formatMonth(seller.memberSince)}`].filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <ScrollToTop />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{seller.name}</h1>
          {seller.isStore ? <Badge variant="secondary">Store</Badge> : null}
        </div>
        <p className="text-muted-foreground">{facts.join(' · ')}</p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
          <p className="font-medium">No ads right now</p>
          <p className="text-sm text-muted-foreground">
            This seller has nothing for sale at the moment.
          </p>
        </div>
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
