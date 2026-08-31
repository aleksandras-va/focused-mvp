'use server';

import { redirect } from 'next/navigation';
import type { CosmeticCondition, FunctionalCondition, Inclusion } from '@/db/tables';
import { requireUser } from '@/services/auth-service';
import { searchCatalog } from '@/services/catalog-service';
import { createListing, ListingError } from '@/services/listing-service';

const INCLUSION_PREFIX = 'inclusion:';

export async function searchModelsAction(term: string) {
  return searchCatalog(term, { limit: 8 });
}

export async function createListingAction(formData: FormData) {
  const user = await requireUser();

  const inclusions = Array.from(formData.keys())
    .filter((key) => key.startsWith(INCLUSION_PREFIX))
    .map((key) => key.slice(INCLUSION_PREFIX.length) as Inclusion);

  let listingId: string;

  try {
    listingId = await createListing({
      sellerId: user.id,
      modelId: String(formData.get('modelId') ?? ''),
      price: String(formData.get('price') ?? ''),
      cosmeticCondition: String(formData.get('cosmeticCondition') ?? '') as CosmeticCondition,
      functionalCondition: String(formData.get('functionalCondition') ?? '') as FunctionalCondition,
      shutterCount: String(formData.get('shutterCount') ?? '') || null,
      location: String(formData.get('location') ?? ''),
      description: String(formData.get('description') ?? '') || null,
      inclusions,
      publish: formData.get('publish') === 'true',
    });
  } catch (error) {
    if (error instanceof ListingError) {
      redirect(`/sell?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect(`/listings/${listingId}`);
}
