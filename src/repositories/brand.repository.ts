import 'server-only';
import { type SqlBool, sql } from 'kysely';
import { db } from '@/db';
import type { ModelCategory } from '@/db/types';
import { toSearchWords } from '@/lib/search-text';

const MIN_WORD_LENGTH = 3;
const TYPO_SIMILARITY = 0.5;
const TYPO_MIN_LENGTH = 4;

function brandMatch(word: string) {
  const name = sql`regexp_replace(lower(brand.name), '[^a-z0-9]', '', 'g')`;
  const typo =
    word.length >= TYPO_MIN_LENGTH
      ? sql<SqlBool>`word_similarity(${word}, ${name}) >= ${TYPO_SIMILARITY}`
      : sql<SqlBool>`false`;

  const named = sql<SqlBool>`(${name} like ${`${word}%`}
    or ${sql.ref('brand.search_terms')} @> ${[word]}::text[])`;

  return { named, condition: sql<SqlBool>`(${named} or ${typo})` };
}

export const brandRepository = {
  search(term: string, limit = 4) {
    const words = toSearchWords(term).filter((word) => !word.isNumeric);
    const isOnlyWord = words.length === 1;
    const matches = words
      .filter((word) => isOnlyWord || word.compact.length >= MIN_WORD_LENGTH)
      .map((word) => brandMatch(word.compact));

    if (matches.length === 0) return Promise.resolve([]);

    return db
      .selectFrom('brand')
      .select(['brand.id', 'brand.slug', 'brand.name'])
      .where(
        sql<SqlBool>`${sql.join(
          matches.map((match) => match.condition),
          sql` or `,
        )}`,
      )
      .orderBy(
        sql`${sql.join(
          matches.map((match) => match.named),
          sql` or `,
        )}`,
        'desc',
      )
      .orderBy('brand.name')
      .limit(limit)
      .execute();
  },

  list(category?: ModelCategory) {
    let query = db
      .selectFrom('brand')
      .innerJoin('model', 'model.brand_id', 'brand.id')
      .select(['brand.id', 'brand.slug', 'brand.name'])
      .groupBy(['brand.id'])
      .orderBy('brand.name');

    if (category) query = query.where('model.category', '=', category);

    return query.execute();
  },
} as const;
