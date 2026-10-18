/**
 * Seeds the gear catalog. Idempotent — safe to re-run after adding model.
 *
 *   pnpm db:seed
 *   pnpm db:seed:prod   (uses PROD_DATABASE_URL)
 *
 * Model names follow how the manufacturer writes them; the permutations
 * people actually type live in `aliases`.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @next/env is CommonJS-only, so it has no named ESM exports.
import nextEnv from '@next/env';
import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import type { DB, ModelCategory } from '../src/db/types';
import { toSearchText, toSearchTokens } from '../src/lib/search-text.ts';
import { ACCESSORIES } from './catalog/accessories.mts';
import { BRANDS } from './catalog/brands.mts';
import { CAMERAS } from './catalog/cameras.mts';
import type { BrandSeed, CameraSeed, LensSeed } from './catalog/catalog.types.mts';
import { LENSES } from './catalog/lenses.mts';
import { MOUNTS } from './catalog/mounts.mts';

const BATCH_SIZE = 500;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

nextEnv.loadEnvConfig(projectRoot);

function readSeedData<Seed>(file: string): Seed[] {
  return JSON.parse(readFileSync(path.join(projectRoot, 'scripts/data', file), 'utf8'));
}

function withImported<Seed>(curated: Seed[], imported: Seed[], key: (seed: Seed) => string) {
  const seedsByKey = new Map<string, Seed>();
  for (const seed of [...curated, ...imported]) {
    seedsByKey.set(key(seed), { ...seed, ...seedsByKey.get(key(seed)) });
  }
  return [...seedsByKey.values()];
}

const cameras = withImported(
  CAMERAS,
  readSeedData<CameraSeed>('lensfun-cameras.json'),
  (camera) => `${camera.brand}/${camera.name}`,
);

const lenses = withImported(
  LENSES,
  [
    ...readSeedData<LensSeed>('lens-db-lenses.json'),
    ...readSeedData<LensSeed>('lensfun-lenses.json'),
  ],
  (lens) => slugify(`${lens.brand} ${lens.name} ${lens.mount}`),
);

const curatedBrandSlugs = new Set(BRANDS.map((brand) => brand.slug));
const brands: BrandSeed[] = [
  ...BRANDS,
  ...new Map(
    lenses
      .filter((lens) => lens.brandName && !curatedBrandSlugs.has(lens.brand))
      .map((lens) => [lens.brand, { slug: lens.brand, name: lens.brandName as string }]),
  ).values(),
];

const databaseUrlVariable = process.argv.includes('--prod') ? 'PROD_DATABASE_URL' : 'DATABASE_URL';
const connectionString = process.env[databaseUrlVariable];

if (!connectionString) {
  throw new Error(`${databaseUrlVariable} is not set — see .env.example`);
}

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString }) }),
});

type ModelSeed = { brand: string; name: string; mount?: string; releaseYear?: number };

function chunked<Row>(rows: Row[]): Row[][] {
  const chunks: Row[][] = [];
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    chunks.push(rows.slice(start, start + BATCH_SIZE));
  }
  return chunks;
}

function modelSlug(entry: ModelSeed, category: ModelCategory): string {
  return slugify(
    category === 'lens' && entry.mount
      ? `${entry.brand} ${entry.name} ${entry.mount}`
      : `${entry.brand} ${entry.name}`,
  );
}

await db.transaction().execute(async (trx) => {
  const brandRows = await trx
    .insertInto('brand')
    .values(brands.map(({ slug, name }) => ({ slug, name })))
    .onConflict((oc) => oc.column('slug').doUpdateSet((eb) => ({ name: eb.ref('excluded.name') })))
    .returning(['id', 'slug'])
    .execute();
  const brandIds = new Map(brandRows.map((row) => [row.slug, row.id]));

  const brandSearchTerms = sql.join(
    brands.map((brand) => sql`(${brand.slug}, ${toSearchTokens(brand.searchTerms ?? [])}::text[])`),
  );
  await sql`
    update brand
    set search_terms = seeded.search_terms
    from (values ${brandSearchTerms}) as seeded (slug, search_terms)
    where brand.slug = seeded.slug
  `.execute(trx);
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));

  const mountRows = await trx
    .insertInto('mount')
    .values(
      MOUNTS.map((mount) => ({
        slug: mount.slug,
        name: mount.name,
        brand_id: mount.brand ? brandIds.get(mount.brand) : null,
      })),
    )
    .onConflict((oc) => oc.column('slug').doUpdateSet((eb) => ({ name: eb.ref('excluded.name') })))
    .returning(['id', 'slug'])
    .execute();
  const mountIds = new Map(mountRows.map((row) => [row.slug, row.id]));

  const mountSearchTerms = sql.join(
    MOUNTS.map((mount) => {
      const tokens = new Set(toSearchTokens([mount.name, ...(mount.searchTerms ?? [])]));
      return sql`(${mount.slug}, ${[...tokens]}::text[])`;
    }),
  );
  await sql`
    update mount
    set search_terms = seeded.search_terms
    from (values ${mountSearchTerms}) as seeded (slug, search_terms)
    where mount.slug = seeded.slug
  `.execute(trx);

  async function upsertModels(
    entries: ModelSeed[],
    category: ModelCategory,
  ): Promise<Map<string, string>> {
    const modelIds = new Map<string, string>();

    for (const chunk of chunked(entries)) {
      const rows = await trx
        .insertInto('model')
        .values(
          chunk.map((entry) => {
            const brandId = brandIds.get(entry.brand);
            if (!brandId) throw new Error(`Unknown brand: ${entry.brand}`);

            const mountId = entry.mount ? mountIds.get(entry.mount) : null;
            if (entry.mount && !mountId) throw new Error(`Unknown mount: ${entry.mount}`);

            return {
              category,
              brand_id: brandId,
              mount_id: mountId,
              name: entry.name,
              display_name: `${brandNames.get(entry.brand)} ${entry.name}`,
              slug: modelSlug(entry, category),
              release_year: entry.releaseYear ?? null,
            };
          }),
        )
        .onConflict((oc) =>
          oc.column('slug').doUpdateSet((eb) => ({
            name: eb.ref('excluded.name'),
            display_name: eb.ref('excluded.display_name'),
            release_year: eb.ref('excluded.release_year'),
          })),
        )
        .returning(['id', 'slug'])
        .execute();

      for (const row of rows) modelIds.set(row.slug, row.id);
    }

    return modelIds;
  }

  function modelId(modelIds: Map<string, string>, entry: ModelSeed, category: ModelCategory) {
    const id = modelIds.get(modelSlug(entry, category));
    if (!id) throw new Error(`Model was not upserted: ${entry.brand} ${entry.name}`);
    return id;
  }

  const cameraModelIds = await upsertModels(cameras, 'camera');
  for (const chunk of chunked(cameras)) {
    await trx
      .insertInto('camera_spec')
      .values(
        chunk.map((camera) => ({
          model_id: modelId(cameraModelIds, camera, 'camera'),
          body_type: camera.bodyType,
          sensor_format: camera.sensorFormat,
          megapixels: camera.megapixels ?? null,
          has_mechanical_shutter: camera.hasMechanicalShutter ?? true,
          is_film: camera.isFilm ?? false,
        })),
      )
      .onConflict((oc) =>
        oc.column('model_id').doUpdateSet((eb) => ({
          body_type: eb.ref('excluded.body_type'),
          sensor_format: eb.ref('excluded.sensor_format'),
          megapixels: eb.ref('excluded.megapixels'),
          is_film: eb.ref('excluded.is_film'),
        })),
      )
      .execute();
  }

  const coded = cameras.filter((camera) => camera.searchTerms?.length);
  for (const chunk of chunked(coded)) {
    const modelSearchTerms = sql.join(
      chunk.map(
        (camera) =>
          sql`(${modelId(cameraModelIds, camera, 'camera')}::uuid, ${toSearchTokens(camera.searchTerms ?? [])}::text[])`,
      ),
    );
    await sql`
      update model
      set search_terms = seeded.search_terms
      from (values ${modelSearchTerms}) as seeded (id, search_terms)
      where model.id = seeded.id
    `.execute(trx);
  }

  const lensModelIds = await upsertModels(lenses, 'lens');
  for (const chunk of chunked(lenses)) {
    await trx
      .insertInto('lens_spec')
      .values(
        chunk.map((lens) => ({
          model_id: modelId(lensModelIds, lens, 'lens'),
          focal_min_mm: lens.focal[0],
          focal_max_mm: lens.focal[1],
          max_aperture: lens.maxAperture,
          has_stabilization: lens.stabilized ?? false,
          filter_thread_mm: lens.filterThreadMm ?? null,
          weight_grams: lens.weightGrams ?? null,
        })),
      )
      .onConflict((oc) =>
        oc.column('model_id').doUpdateSet((eb) => ({
          focal_min_mm: eb.ref('excluded.focal_min_mm'),
          focal_max_mm: eb.ref('excluded.focal_max_mm'),
          max_aperture: eb.ref('excluded.max_aperture'),
          weight_grams: eb.ref('excluded.weight_grams'),
        })),
      )
      .execute();
  }

  await upsertModels(ACCESSORIES, 'accessory');

  const models = await trx.selectFrom('model').select(['id', 'display_name']).execute();
  for (const chunk of chunked(models)) {
    const searchTexts = sql.join(
      chunk.map((model) => sql`(${model.id}::uuid, ${toSearchText(model.display_name)})`),
    );
    await sql`
      update model
      set search_text = indexed.search_text
      from (values ${searchTexts}) as indexed (id, search_text)
      where model.id = indexed.id
    `.execute(trx);
  }
});

const [{ total }] = await db
  .selectFrom('model')
  .select((eb) => eb.fn.countAll<number>().as('total'))
  .execute();

console.log(`Seeded ${total} models.`);

await db.destroy();
