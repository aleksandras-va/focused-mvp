import { CameraIcon } from 'lucide-react';
import Link from 'next/link';
import { ListingCard, toListingCardItem } from '@/components/features/browse/listing-card';
import { CategoryPills } from '@/components/features/home/category-pills';
import { type FeaturedPhoto, Hero } from '@/components/features/home/hero';
import { SellBreak } from '@/components/features/home/sell-break';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ModelCategory } from '@/db/tables';
import { CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';
import type { ListingSummary } from '@/services/listing/listing.types';

type HomeProps = {
  listings: ListingSummary[];
  category: ModelCategory | null;
  featuredPhoto: FeaturedPhoto;
};

export function Home({ listings, category, featuredPhoto }: HomeProps) {
  return (
    <>
      <Hero photo={featuredPhoto} />

      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 pt-8 pb-16 sm:px-6">
        <CategoryPills active={category} />

        <section className="flex flex-col gap-5">
          <h2 className="font-heading font-bold text-2xl">
            {category
              ? `Recent ${CATEGORY_PLURAL_LABELS[category].toLowerCase()}`
              : 'Recently listed'}
          </h2>

          {listings.length === 0 ? (
            <EmptyState
              icon={<CameraIcon />}
              title="Nothing here yet"
              description="Be the first to list one."
            >
              <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
                Sell gear
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} item={toListingCardItem(listing)} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <SellBreak />
        </div>
      </div>
    </>
  );
}
