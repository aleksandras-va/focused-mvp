import Link from 'next/link';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { buttonVariants } from '@/components/ui/button';
import type { ListingSummary } from '@/services/listing/listing.types';

export function SellerListings({ listings }: { listings: ListingSummary[] }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">Your ads</h2>
        <Link href="/sell" className={buttonVariants()}>
          Sell
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="font-medium">No ads yet</p>
          <p className="text-sm text-muted-foreground">
            List a camera, lens or accessory in a few minutes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} item={toListingCardItem(listing)} />
          ))}
        </div>
      )}
    </section>
  );
}
