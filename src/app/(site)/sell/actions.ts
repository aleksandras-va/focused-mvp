'use server';

import { revalidatePath } from 'next/cache';
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
  return modelCatalogService.searchModel(term, { limit: 8 });
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

export type SavedDraft = { id: string; itemIds: string[]; error: null } | { error: string };

export async function saveListingDraftAction(
  listingId: string | null,
  payload: CreateListingPayload,
): Promise<SavedDraft> {
  try {
    const user = await authService.requireUser();
    const listing = await listingService.save(listingId, user.id, { ...payload, publish: false });

    revalidatePath('/user');

    return { id: listing.id, itemIds: listing.itemIds, error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to save a draft.' };
    if (error instanceof ListingError) return { error: error.message };

    throw error;
  }
}

export async function submitListingAction(
  listingId: string | null,
  payload: CreateListingPayload,
): Promise<{ error: string }> {
  let listing: CreatedListing;

  try {
    const user = await authService.requireUser();

    listing = await listingService.save(listingId, user.id, payload);
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to save your ad.' };
    if (error instanceof ListingError) return { error: error.message };

    throw error;
  }

  revalidatePath('/user');
  redirect(listing.itemIds.length > 1 ? `/bundles/${listing.id}` : `/items/${listing.itemIds[0]}`);
}

export type OwnerActionResult = { error: string | null };

export async function markListingSoldAction(listingId: string) {
  return runOwnerAction(listingId, (userId) => listingService.markSold(listingId, userId));
}

export async function hideListingAction(listingId: string) {
  return runOwnerAction(listingId, (userId) => listingService.hide(listingId, userId));
}

export async function restoreListingAction(listingId: string) {
  return runOwnerAction(listingId, (userId) => listingService.restore(listingId, userId));
}

export async function deleteListingAction(listingId: string): Promise<OwnerActionResult> {
  const result = await runOwnerAction(listingId, (userId) =>
    listingService.remove(listingId, userId),
  );

  if (result.error) return result;

  redirect('/user');
}

async function runOwnerAction(
  listingId: string,
  run: (userId: string) => Promise<void>,
): Promise<OwnerActionResult> {
  try {
    const user = await authService.requireUser();

    await run(user.id);
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Sign in to manage your ads.' };
    if (error instanceof ListingError) return { error: error.message };

    throw error;
  }

  revalidatePath('/user');
  revalidatePath(`/bundles/${listingId}`);
  revalidatePath('/items/[id]', 'page');

  return { error: null };
}
