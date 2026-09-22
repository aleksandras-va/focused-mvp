import 'server-only';
import { type SqlBool, sql } from 'kysely';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';

export type ModelRow = Awaited<ReturnType<ReturnType<typeof modelQuery>['execute']>>[number];

export type ModelSearchRow = ModelRow & { score: number };

export type ModelDetailRow = NonNullable<Awaited<ReturnType<typeof modelRepository.findBySlug>>>;

export const modelRepository = {
  search(term: string, options: { category?: ModelCategory; limit?: number } = {}) {
    const needle = normalizeSearchTerm(term);

    let query = modelQuery()
      .select(sql<number>`word_similarity(${needle}, model.normalized)`.as('score'))
      .where(
        sql<SqlBool>`word_similarity(${needle}, model.normalized) >= 0.3
        or model.normalized like ${needle} || '%'`,
      )
      .orderBy('score', 'desc')
      .orderBy(sql`length(model.display_name)`)
      .orderBy('model.release_year', 'desc')
      .limit(options.limit ?? 20);

    if (options.category) {
      query = query.where('model.category', '=', options.category);
    }

    return query.execute();
  },

  findBySlug(slug: string) {
    return modelQuery()
      .leftJoin('lens_spec', 'lens_spec.model_id', 'model.id')
      .select([
        'camera_spec.body_type',
        'camera_spec.sensor_format',
        'camera_spec.megapixels',
        'camera_spec.has_mechanical_shutter',
        'lens_spec.focal_min_mm',
        'lens_spec.focal_max_mm',
        'lens_spec.max_aperture',
        'lens_spec.has_stabilization',
        'lens_spec.filter_thread_mm',
      ])
      .where('model.slug', '=', slug)
      .executeTakeFirst();
  },

  listSuggested(limit = 6) {
    return modelQuery()
      .orderBy(
        sql`(select count(*) from listing_item
        join listing on listing.id = listing_item.listing_id and listing.status = 'active'
        where listing_item.model_id = model.id)`,
        'desc',
      )
      .orderBy('model.release_year', 'desc')
      .limit(limit)
      .execute();
  },

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];

    return modelQuery().where('model.id', 'in', ids).execute();
  },

  async findForListing(ids: string[]) {
    if (ids.length === 0) return [];

    return db
      .selectFrom('model')
      .leftJoin('camera_spec', 'camera_spec.model_id', 'model.id')
      .select(['model.id', 'model.category', 'model.mount_id', 'camera_spec.is_film'])
      .where('model.id', 'in', ids)
      .execute();
  },
} as const;

function normalizeSearchTerm(term: string) {
  return sql<string>`lower(regexp_replace(${term}, '[^a-zA-Z0-9 ]', '', 'g'))`;
}

function modelQuery() {
  return db
    .selectFrom('model')
    .innerJoin('brand', 'brand.id', 'model.brand_id')
    .leftJoin('mount', 'mount.id', 'model.mount_id')
    .leftJoin('camera_spec', 'camera_spec.model_id', 'model.id')
    .select([
      'model.id',
      'model.slug',
      'model.category',
      'model.name',
      'model.display_name',
      'model.release_year',
      'brand.name as brand_name',
      'brand.slug as brand_slug',
      'mount.name as mount_name',
      'mount.slug as mount_slug',
      'camera_spec.is_film',
    ]);
}
