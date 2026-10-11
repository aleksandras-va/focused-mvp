import 'server-only';

import { CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';
import type { SimilarityStep } from '@/repositories/listing.repository';
import type { CatalogModel } from '../model-catalog/model-catalog.types';
import { ListingError } from './listing.error';

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

export function similarListingsTitle(step: SimilarityStep, model: CatalogModel) {
  const gear = CATEGORY_PLURAL_LABELS[model.category].toLowerCase();

  if (step === 'focalLength' && model.mount) return `Similar ${model.mount.name} lenses`;
  if (step === 'mount' && model.mount) return `Other ${model.mount.name} ${gear}`;
  if (step === 'brand') return `Other ${model.brand.name} ${gear}`;

  return 'Newest ads';
}
