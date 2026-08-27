import "server-only";
import { type SqlBool, sql } from "kysely";
import { db } from "@/db";
import type { ModelCategory } from "@/db/types";

/**
 * Mirrors the generated `model_aliases.normalized` column, so a search term is
 * folded exactly the way stored aliases were: "Fuji X-T3" -> "fujixt3".
 */
function normalize(term: string) {
  return sql<string>`lower(regexp_replace(${term}, '[^a-zA-Z0-9]+', '', 'g'))`;
}

/** Model rows always carry their brand, mount, and canonical display name. */
function modelQuery() {
  return db
    .selectFrom("models")
    .innerJoin("brands", "brands.id", "models.brand_id")
    .leftJoin("mounts", "mounts.id", "models.mount_id")
    .innerJoin("model_aliases as canonical", (join) =>
      join
        .onRef("canonical.model_id", "=", "models.id")
        .on("canonical.is_canonical", "=", true),
    )
    .select([
      "models.id",
      "models.slug",
      "models.category",
      "models.name",
      "models.release_year",
      "brands.name as brand_name",
      "brands.slug as brand_slug",
      "mounts.name as mount_name",
      "mounts.slug as mount_slug",
      "canonical.alias as display_name",
    ]);
}

/** The columns every model query returns; search and detail both widen it. */
export type ModelRow = Awaited<
  ReturnType<ReturnType<typeof modelQuery>["execute"]>
>[number];

export type ModelSearchRow = ModelRow & { score: number };

export type ModelDetailRow = NonNullable<
  Awaited<ReturnType<typeof findModelBySlug>>
>;

/**
 * Finds models by any name a seller might type. Exact alias matches rank above
 * prefixes, which rank above trigram-similar strings (real typos).
 */
export function searchModels(
  term: string,
  options: { category?: ModelCategory; limit?: number } = {},
) {
  const needle = normalize(term);

  let query = modelQuery()
    .innerJoin("model_aliases as match", "match.model_id", "models.id")
    .select(
      sql<number>`max(
        case
          when match.normalized = ${needle} then 1
          when match.normalized like ${needle} || '%' then 0.9
          else similarity(match.normalized, ${needle})
        end
      )`.as("score"),
    )
    // `%` is the pg_trgm operator, so this hits the GIN index.
    .where(
      sql<SqlBool>`match.normalized = ${needle}
        or match.normalized like ${needle} || '%'
        or match.normalized % ${needle}`,
    )
    .groupBy(["models.id", "brands.id", "mounts.id", "canonical.id"])
    .orderBy("score", "desc")
    .orderBy("models.release_year", "desc")
    .limit(options.limit ?? 20);

  if (options.category) {
    query = query.where("models.category", "=", options.category);
  }

  return query.execute();
}

/** One model with whichever spec table applies to its category. */
export function findModelBySlug(slug: string) {
  return modelQuery()
    .leftJoin("camera_specs", "camera_specs.model_id", "models.id")
    .leftJoin("lens_specs", "lens_specs.model_id", "models.id")
    .select([
      "camera_specs.body_type",
      "camera_specs.sensor_format",
      "camera_specs.megapixels",
      "camera_specs.has_mechanical_shutter",
      "lens_specs.focal_min_mm",
      "lens_specs.focal_max_mm",
      "lens_specs.max_aperture",
      "lens_specs.has_stabilization",
      "lens_specs.filter_thread_mm",
    ])
    .where("models.slug", "=", slug)
    .executeTakeFirst();
}
