'use server';

import { getSuggestedModels, searchSite } from '@/services/catalog-service';

export async function searchSiteAction(term: string) {
  return searchSite(term);
}

export async function getSearchSuggestionsAction() {
  return getSuggestedModels();
}
