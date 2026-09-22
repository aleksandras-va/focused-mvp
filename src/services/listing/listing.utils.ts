import 'server-only';

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
