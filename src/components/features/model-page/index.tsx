import { ModelUnavailable } from '@/components/features/browse/model-unavailable';
import { ModelHeader } from '@/components/features/model-page/model-header';
import { ModelListings } from '@/components/features/model-page/model-listings';
import { ModelSpecs } from '@/components/features/model-page/model-specs';
import type { ListingSummary, SimilarListings } from '@/services/listing/listing.types';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';

interface ModelPageProps {
  model: CatalogModelWithOffers;
  listings: ListingSummary[];
  hasMore: boolean;
  page: number;
  similar: SimilarListings | null;
}

export function ModelPage({ model, listings, hasMore, page, similar }: ModelPageProps) {
  return (
    <div className="flex flex-col gap-10 py-4 sm:py-8">
      <ModelHeader model={model} />
      <ModelSpecs model={model} />
      {similar ? (
        <ModelUnavailable modelName={model.displayName} similar={similar} />
      ) : (
        <ModelListings model={model} listings={listings} hasMore={hasMore} page={page} />
      )}
    </div>
  );
}
