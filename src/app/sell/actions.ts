'use server';

import { redirect } from 'next/navigation';
import { AuthError, requireUser } from '@/services/auth-service';
import { searchCatalog } from '@/services/catalog-service';
import { type CreateListingInput, createListing, ListingError } from '@/services/listing-service';
import { createPhotoUpload, PhotoStorageError, type PhotoUpload } from '@/services/photo-service';

export type CreateListingPayload = Omit<CreateListingInput, 'sellerId'>;

export async function searchModelsAction(term: string) {
  return searchCatalog(term, { limit: 8 });
}

export async function createPhotoUploadAction(): Promise<PhotoUpload | { error: string }> {
  try {
    await requireUser();
    return await createPhotoUpload();
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to upload photos.' };
    if (error instanceof PhotoStorageError) return { error: error.message };
    throw error;
  }
}

export async function createListingAction(
  payload: CreateListingPayload,
): Promise<{ error: string }> {
  let listingId: string;

  try {
    const user = await requireUser();
    listingId = await createListing({ ...payload, sellerId: user.id });
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to publish a listing.' };
    if (error instanceof ListingError) return { error: error.message };
    throw error;
  }

  redirect(`/listings/${listingId}`);
}
