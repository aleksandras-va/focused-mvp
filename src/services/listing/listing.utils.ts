import 'server-only';

import type { SimilarityStep } from '@/repositories/listing.repository';
import type { CatalogModel } from '../model-catalog/model-catalog.types';
import { ListingError } from './listing.error';
import type { SimilarListingsBasis } from './listing.types';

export function parsePriceCents(price: string) {
  const normalized = price.trim().replace(',', '.');
  const value = Number(normalized);

  if (!normalized || Number.isNaN(value) || value < 0) {
    throw new ListingError('Enter a valid price.');
  }

  return Math.round(value * 100);
}

export function optionalPriceCents(price: string) {
  return price.trim() ? parsePriceCents(price) : null;
}

export function centsToPriceInput(cents: number) {
  return (cents / 100).toString();
}

export function parseShutterCount(shutterCount: string | null) {
  if (!shutterCount?.trim()) return null;

  const value = Number(shutterCount.trim());

  if (!Number.isInteger(value) || value < 0) {
    throw new ListingError('Shutter count must be a whole number.');
  }

  return value;
}

export function similarListingsBasis(
  step: SimilarityStep,
  model: CatalogModel,
): { basis: SimilarListingsBasis; basisName: string | null } {
  if (step === 'focalLength' && model.mount) {
    return { basis: 'similarLenses', basisName: model.mount.name };
  }
  if (step === 'mount' && model.mount) return { basis: 'sameMount', basisName: model.mount.name };
  if (step === 'brand') return { basis: 'sameBrand', basisName: model.brand.name };

  return { basis: 'newest', basisName: null };
}
