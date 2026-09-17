'use server';

import { redirect } from 'next/navigation';
import { AuthError } from '@/services/auth/auth.error';
import { authService } from '@/services/auth/auth.service';
import { ListingError } from '@/services/listing/listing.error';
import { listingService } from '@/services/listing/listing.service';
import type { CreatedListing, CreateListingPayload } from '@/services/listing/listing.types';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';
import { PhotoStorageError } from '@/services/photo/photo.error';
import { photoService } from '@/services/photo/photo.service';
import type { PhotoUpload } from '@/services/photo/photo.types';

export async function searchModelsAction(term: string) {
  return modelCatalogService.search(term, { limit: 8 });
}

export async function createPhotoUploadAction(): Promise<PhotoUpload | { error: string }> {
  try {
    await authService.requireUser();

    return await photoService.createUpload();
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to upload photos.' };
    if (error instanceof PhotoStorageError) return { error: error.message };

    throw error;
  }
}

export async function createListingAction(
  payload: CreateListingPayload,
): Promise<{ error: string }> {
  let listing: CreatedListing;

  try {
    const user = await authService.requireUser();

    listing = await listingService.create({ ...payload, sellerId: user.id });
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to publish a listing.' };
    if (error instanceof ListingError) return { error: error.message };

    throw error;
  }

  redirect(listing.itemIds.length > 1 ? `/bundles/${listing.id}` : `/items/${listing.itemIds[0]}`);
}
