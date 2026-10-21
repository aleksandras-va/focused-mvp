import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ListingFeed } from '@/components/features/browse/listing-feed';
import { buttonVariants } from '@/components/ui/button';
import { modelHref } from '@/lib/model-href';
import type { ListingSummary } from '@/services/listing/listing.types';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';

interface ModelListingsProps {
  model: CatalogModelWithOffers;
  listings: ListingSummary[];
  hasMore: boolean;
  page: number;
}

export function ModelListings({ model, listings, hasMore, page }: ModelListingsProps) {
  const t = useTranslations('modelPage');
  const tBrowse = useTranslations('browse');

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">
        {t('listingsTitle', { name: model.displayName })}
      </h2>
      <ListingFeed listings={listings} breaks={[]} />
      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Link
            href={`${modelHref(model.slug)}?page=${page + 1}`}
            scroll={false}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            {tBrowse('loadMore')}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
