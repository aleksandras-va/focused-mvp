'use server';

import { modelCatalogService } from '@/services/model-catalog/model-catalog.service';

export async function searchSiteAction(term: string) {
  return modelCatalogService.searchBrandAndModel(term);
}

export async function getSearchSuggestionsAction() {
  return modelCatalogService.getSuggested();
}
