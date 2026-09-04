import 'server-only';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';

export function searchBrands(term: string, limit = 4) {
  return db
    .selectFrom('brand')
    .select(['brand.id', 'brand.slug', 'brand.name'])
    .where('brand.name', 'ilike', `${term}%`)
    .orderBy('brand.name')
    .limit(limit)
    .execute();
}

/** Brands that actually have models in the catalog, for filter menus. */
export function listBrandsInUse(category?: ModelCategory) {
  let query = db
    .selectFrom('brand')
    .innerJoin('model', 'model.brand_id', 'brand.id')
    .select(['brand.id', 'brand.slug', 'brand.name'])
    .groupBy(['brand.id'])
    .orderBy('brand.name');

  if (category) query = query.where('model.category', '=', category);

  return query.execute();
}
