import { SearchXIcon } from 'lucide-react';
import Link from 'next/link';
import { ListingFeed } from '@/components/features/browse/listing-feed';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { SimilarListings } from '@/services/listing/listing.types';

interface ModelUnavailableProps {
  modelName: string;
  similar: SimilarListings;
}

export function ModelUnavailable({ modelName, similar }: ModelUnavailableProps) {
  return (
    <div className="flex flex-col gap-8">
      <EmptyState
        icon={<SearchXIcon className="text-primary" />}
        title={`No ${modelName} for sale right now`}
        description="Here is the closest gear listed at the moment."
        className="py-10"
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
            Sell yours
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
            Browse all ads
          </Link>
        </div>
      </EmptyState>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold">{similar.title}</h2>
        <ListingFeed listings={similar.listings} breaks={[]} />
      </section>
    </div>
  );
}
