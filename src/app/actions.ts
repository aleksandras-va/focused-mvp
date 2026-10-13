'use server';

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
