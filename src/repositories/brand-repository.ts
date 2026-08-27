import "server-only";
import { db } from "@/db";
import type { ModelCategory } from "@/db/types";

/** Brands that actually have models in the catalog, for filter menus. */
export function listBrandsInUse(category?: ModelCategory) {
  let query = db
    .selectFrom("brands")
    .innerJoin("models", "models.brand_id", "brands.id")
    .select(["brands.id", "brands.slug", "brands.name"])
    .groupBy(["brands.id"])
    .orderBy("brands.name");

  if (category) query = query.where("models.category", "=", category);

  return query.execute();
}
