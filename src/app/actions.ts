'use server';

import { AccountError } from '@/services/account/account.error';
import { accountService } from '@/services/account/account.service';
import { analyticsService } from '@/services/analytics/analytics.service';
import type { ListingReference, SearchOutcome } from '@/services/analytics/analytics.types';
import { authService } from '@/services/auth/auth.service';
import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

export async function searchSiteAction(term: string) {
  return modelCatalogService.searchBrandAndModel(term);
}

export async function getSearchSuggestionsAction() {
  return modelCatalogService.getSuggested();
}

export async function trackSearchAction(search: SearchOutcome) {
  await analyticsService.track(await currentUserId(), 'Searched', search);
}

export async function trackListingViewAction(listing: ListingReference) {
  await analyticsService.track(await currentUserId(), 'Listing Viewed', listing);
}

export async function trackMessageClickAction(listing: ListingReference) {
  await analyticsService.track(await currentUserId(), 'Message Clicked', listing);
}

async function currentUserId() {
  return (await authService.getCurrentUserCached())?.id ?? null;
}

export async function completeProfileAction(
  _state: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const user = await authService.getCurrentUserCached();

  if (!user) return { error: 'Log in first.' };

  try {
    await accountService.updateProfile(user.id, {
      displayName: String(formData.get('displayName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      cityId: String(formData.get('cityId') ?? ''),
    });
  } catch (error) {
    if (error instanceof AccountError) return { error: error.message };

    throw error;
  }

  await accountService.dismissProfilePrompt();

  return { error: null };
}

export async function skipProfilePromptAction() {
  await accountService.dismissProfilePrompt();
}
