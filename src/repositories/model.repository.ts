import 'server-only';
import { type SqlBool, sql } from 'kysely';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';
import { mentionsLensSpec, type SearchWord, toSearchWords } from '@/lib/search-text';

export type ModelRow = Awaited<ReturnType<ReturnType<typeof modelQuery>['execute']>>[number];

export type ModelSearchRow = ModelRow & { score: number };

export type ModelDetailRow = NonNullable<Awaited<ReturnType<typeof modelRepository.findBySlug>>>;

export const modelRepository = {
  search(term: string, options: { category?: ModelCategory; limit?: number } = {}) {
    const words = toSearchWords(term);
    if (words.length === 0) return Promise.resolve([]);

    const matches = words.map((word, index) => wordMatch(word, index === words.length - 1));
    const score = sql.join(
      [
        ...matches.map((match) => match.score),
        ...words.slice(1).map((word, index) => inOrderScore(words[index], word)),
      ],
      sql` + `,
    );
    const condition = sql.join(
      matches.map((match) => match.condition),
      sql` and `,
    );

    let query = modelQuery()
      .select(sql<number>`${score}`.as('score'))
      .where(sql<SqlBool>`${condition}`)
      .orderBy(sql`model.category = 'lens' and ${mentionsLensSpec(term)}::boolean`, 'desc')
      .orderBy('score', 'desc')
      .orderBy(sql`cardinality(${NAME_TOKENS})`)
      .orderBy(sql`length(model.display_name)`)
      .orderBy('model.release_year', 'desc')
      .orderBy('model.id')
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

const SEARCH_TEXT = sql.ref('model.search_text');
const SEARCH_TERMS = sql<
  string[]
>`(${sql.ref('brand.search_terms')} || ${sql.ref('model.search_terms')})`;
const NAME_TOKENS = sql<string[]>`string_to_array(${SEARCH_TEXT}, ' ')`;
const SEARCH_TOKENS = sql<string[]>`(${NAME_TOKENS} || ${SEARCH_TERMS})`;
const MOUNT_TOKENS = sql<string[]>`coalesce(${sql.ref('mount.search_terms')}, '{}')`;
const SEARCH_COMPACT = sql<string>`replace(${SEARCH_TEXT}, ' ', '')`;
const SEARCH_TERMS_COMPACT = sql<string>`array_to_string(${SEARCH_TERMS}, '')`;

const EXACT_SCORE = 2;
const ADJACENT_SCORE = 1;
const IN_ORDER_SCORE = 3;
const DESIGNATION_SCORE = 3;
const MOUNT_SCORE = 1;
const FUZZY_SIMILARITY = 0.5;
const FUZZY_MIN_LENGTH = 4;
const COMPACT_MIN_LENGTH = 2;

function inOrderScore(previous: SearchWord, word: SearchWord) {
  const typedTogether = `%${previous.compact}${word.compact}%`;

  return sql<number>`(case when ${SEARCH_COMPACT} like ${typedTogether} then ${IN_ORDER_SCORE}::int else 0 end)`;
}

function wordMatch(word: SearchWord, isLastWord: boolean) {
  const exact = sql<SqlBool>`${SEARCH_TOKENS} @> ${word.tokens}::text[]`;
  const adjacent =
    !word.isNumeric && word.compact.length >= COMPACT_MIN_LENGTH
      ? sql<SqlBool>`(${SEARCH_COMPACT} like ${`%${word.compact}%`}
          or ${SEARCH_TERMS_COMPACT} like ${`%${word.compact}%`})`
      : sql<SqlBool>`false`;

  const isDesignation = sql<SqlBool>`${word.tokens.length > 1}::boolean`;
  const mount = sql<SqlBool>`${MOUNT_TOKENS} @> ${word.tokens}::text[]`;
  const alternatives = [exact, adjacent, mount];

  const [token] = word.tokens;
  if (word.tokens.length === 1 && !word.isNumeric && token.length >= FUZZY_MIN_LENGTH) {
    alternatives.push(
      sql<SqlBool>`word_similarity(${token}, ${SEARCH_TEXT}) >= ${FUZZY_SIMILARITY}`,
    );
  }

  if (isLastWord) {
    const completeTokens = word.tokens.slice(0, -1);
    const unfinishedToken = word.tokens[word.tokens.length - 1];
    alternatives.push(
      sql<SqlBool>`(${SEARCH_TOKENS} || ${MOUNT_TOKENS} @> ${completeTokens}::text[] and exists (
        select 1 from unnest(${SEARCH_TOKENS} || ${MOUNT_TOKENS}) as token
        where token like ${`${unfinishedToken}%`}
      ))`,
    );
  }

  return {
    condition: sql<SqlBool>`(${sql.join(alternatives, sql` or `)})`,
    score: sql<number>`(case when ${exact} then ${EXACT_SCORE}::int else 0 end
      + case when ${adjacent} then ${ADJACENT_SCORE}::int else 0 end
      + case when ${isDesignation} and ${exact} and ${adjacent} then ${DESIGNATION_SCORE}::int else 0 end
      + case when ${mount} and not ${exact} then ${MOUNT_SCORE}::int else 0 end)`,
  };
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
