import 'server-only';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';

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
