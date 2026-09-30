import { PackageOpenIcon } from 'lucide-react';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
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
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-accent-foreground">
          {seller.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{seller.name}</h1>
            {seller.isStore ? <Badge variant="secondary">Store</Badge> : null}
          </div>
          <p className="text-muted-foreground">{facts.join(' · ')}</p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">
          {listings.length === 1 ? '1 ad' : `${listings.length} ads`}
        </h2>

        {listings.length === 0 ? (
          <EmptyState
            icon={<PackageOpenIcon />}
            title="Nothing for sale right now"
            description="Check back later — sellers list new gear all the time."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} item={toListingCardItem(listing)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
