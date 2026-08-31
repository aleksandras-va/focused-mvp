import 'server-only';
import { type SqlBool, sql } from 'kysely';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';

function normalize(term: string) {
  return sql<string>`lower(regexp_replace(${term}, '[^a-zA-Z0-9 ]', '', 'g'))`;
}

function modelQuery() {
  return db
    .selectFrom('models')
    .innerJoin('brands', 'brands.id', 'models.brand_id')
    .leftJoin('mounts', 'mounts.id', 'models.mount_id')
    .select([
      'models.id',
      'models.slug',
      'models.category',
      'models.name',
      'models.display_name',
      'models.release_year',
      'brands.name as brand_name',
      'brands.slug as brand_slug',
      'mounts.name as mount_name',
      'mounts.slug as mount_slug',
    ]);
}

export type ModelRow = Awaited<ReturnType<ReturnType<typeof modelQuery>['execute']>>[number];

export type ModelSearchRow = ModelRow & { score: number };

export type ModelDetailRow = NonNullable<Awaited<ReturnType<typeof findModelBySlug>>>;

export function searchModels(
  term: string,
  options: { category?: ModelCategory; limit?: number } = {},
) {
  const needle = normalize(term);

  let query = modelQuery()
    .select(sql<number>`word_similarity(${needle}, models.normalized)`.as('score'))
    .where(
      sql<SqlBool>`word_similarity(${needle}, models.normalized) >= 0.3
        or models.normalized like ${needle} || '%'`,
    )
    .orderBy('score', 'desc')
    .orderBy(sql`length(models.display_name)`)
    .orderBy('models.release_year', 'desc')
    .limit(options.limit ?? 20);

  if (options.category) {
    query = query.where('models.category', '=', options.category);
  }

  return query.execute();
}

export function findModelBySlug(slug: string) {
  return modelQuery()
    .leftJoin('camera_specs', 'camera_specs.model_id', 'models.id')
    .leftJoin('lens_specs', 'lens_specs.model_id', 'models.id')
    .select([
      'camera_specs.body_type',
      'camera_specs.sensor_format',
      'camera_specs.megapixels',
      'camera_specs.has_mechanical_shutter',
      'lens_specs.focal_min_mm',
      'lens_specs.focal_max_mm',
      'lens_specs.max_aperture',
      'lens_specs.has_stabilization',
      'lens_specs.filter_thread_mm',
    ])
    .where('models.slug', '=', slug)
    .executeTakeFirst();
}
