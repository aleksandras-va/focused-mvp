import { CameraIcon } from 'lucide-react';
import Link from 'next/link';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { ListingSummary } from '@/services/listing/listing.types';

export function SellerListings({ listings }: { listings: ListingSummary[] }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold">Your ads</h2>

        <Link href="/sell" className={cn(buttonVariants())}>
          Sell
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={<CameraIcon />}
          title="No ads yet"
          description="List a camera, lens or accessory in a few minutes."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} item={toListingCardItem(listing)} />
          ))}
        </div>
      )}
    </section>
  );
}
