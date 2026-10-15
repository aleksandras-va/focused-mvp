import { SearchXIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ListingFeed } from '@/components/features/browse/listing-feed';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { SimilarListings } from '@/services/listing/listing.types';

interface ModelUnavailableProps {
  modelName: string;
  similar: SimilarListings;
}

export function ModelUnavailable({ modelName, similar }: ModelUnavailableProps) {
  const t = useTranslations('browse');

  return (
    <div className="flex flex-col gap-8">
      <EmptyState
        icon={<SearchXIcon className="text-primary" />}
        title={t('modelUnavailable.title', { model: modelName })}
        description={t('modelUnavailable.description')}
        className="py-10"
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
            {t('modelUnavailable.sellYours')}
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'ghost' })}>
            {t('modelUnavailable.browseAll')}
          </Link>
        </div>
      </EmptyState>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold">
          {t(`similar.${similar.basis}`, {
            name: similar.basisName ?? '',
            category: similar.category,
          })}
        </h2>
        <ListingFeed listings={similar.listings} breaks={[]} />
      </section>
    </div>
  );
}
