/**
 * Seeds the gear catalog. Idempotent — safe to re-run after adding model.
 *
 *   pnpm db:seed
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
import type { CameraBodyType, DB, ModelCategory, SensorFormat } from '../src/db/types';
import { toSearchText, toSearchTokens } from '../src/lib/search-text.ts';

type BrandSeed = { slug: string; name: string; searchTerms?: string[] };
type MountSeed = { slug: string; name: string; brand?: string; searchTerms?: string[] };

type CameraSeed = {
  brand: string;
  name: string;
  mount?: string;
  releaseYear?: number;
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat | null;
  megapixels?: number;
  hasMechanicalShutter?: boolean;
  isFilm?: boolean;
  searchTerms?: string[];
};

type LensSeed = {
  brand: string;
  name: string;
  mount: string;
  releaseYear?: number;
  focal: [number, number];
  maxAperture: number;
  stabilized?: boolean;
  filterThreadMm?: number;
  weightGrams?: number;
  brandName?: string;
};

type AccessorySeed = {
  brand: string;
  name: string;
  releaseYear?: number;
};

const BATCH_SIZE = 500;

const BRANDS: BrandSeed[] = [
  { slug: 'canon', name: 'Canon' },
  { slug: 'casio', name: 'Casio' },
  { slug: 'fujifilm', name: 'Fujifilm', searchTerms: ['Fujinon'] },
  { slug: 'hasselblad', name: 'Hasselblad' },
  { slug: 'helios', name: 'Helios' },
  { slug: 'konica-minolta', name: 'Konica Minolta', searchTerms: ['Dynax', 'Maxxum'] },
  { slug: 'leica', name: 'Leica', searchTerms: ['Leitz'] },
  { slug: 'minolta', name: 'Minolta' },
  { slug: 'nikon', name: 'Nikon', searchTerms: ['Nikkor'] },
  { slug: 'olympus', name: 'Olympus', searchTerms: ['Zuiko'] },
  { slug: 'om-system', name: 'OM System', searchTerms: ['Olympus', 'Zuiko'] },
  { slug: 'panasonic', name: 'Panasonic', searchTerms: ['Lumix'] },
  { slug: 'peak-design', name: 'Peak Design' },
  { slug: 'pentax', name: 'Pentax', searchTerms: ['Takumar'] },
  { slug: 'ricoh', name: 'Ricoh' },
  { slug: 'samsung', name: 'Samsung' },
  { slug: 'samyang', name: 'Samyang', searchTerms: ['Rokinon'] },
  { slug: 'sigma', name: 'Sigma' },
  { slug: 'smallrig', name: 'SmallRig' },
  { slug: 'sony', name: 'Sony', searchTerms: ['Alpha'] },
  { slug: 'tamron', name: 'Tamron' },
  { slug: 'tokina', name: 'Tokina' },
  { slug: 'viltrox', name: 'Viltrox' },
  { slug: 'zeiss', name: 'Zeiss', searchTerms: ['Carl Zeiss'] },
  { slug: 'zenit', name: 'Zenit' },
];

const MOUNTS: MountSeed[] = [
  { slug: 'canon-ef', name: 'Canon EF', brand: 'canon' },
  { slug: 'canon-ef-m', name: 'Canon EF-M', brand: 'canon', searchTerms: ['EOS M', 'EFM'] },
  { slug: 'canon-ef-s', name: 'Canon EF-S', brand: 'canon', searchTerms: ['EFS'] },
  { slug: 'canon-fd', name: 'Canon FD', brand: 'canon' },
  { slug: 'canon-rf', name: 'Canon RF', brand: 'canon' },
  { slug: 'fujifilm-g', name: 'Fujifilm G', brand: 'fujifilm', searchTerms: ['Fuji', 'GFX', 'GF'] },
  { slug: 'fujifilm-x', name: 'Fujifilm X', brand: 'fujifilm', searchTerms: ['Fuji', 'XF'] },
  { slug: 'hasselblad-x', name: 'Hasselblad X', brand: 'hasselblad', searchTerms: ['XCD'] },
  {
    slug: 'leica-ltm',
    name: 'Leica L39 (LTM)',
    brand: 'leica',
    searchTerms: ['M39', 'LSM', 'Screw'],
  },
  { slug: 'leica-m', name: 'Leica M', brand: 'leica' },
  { slug: 'minolta-md', name: 'Minolta MD', brand: 'minolta', searchTerms: ['MC', 'SR'] },
  { slug: 'nikon-1', name: 'Nikon 1', brand: 'nikon', searchTerms: ['CX'] },
  { slug: 'nikon-f', name: 'Nikon F', brand: 'nikon' },
  { slug: 'nikon-z', name: 'Nikon Z', brand: 'nikon' },
  { slug: 'pentax-645', name: 'Pentax 645', brand: 'pentax' },
  { slug: 'pentax-k', name: 'Pentax K', brand: 'pentax', searchTerms: ['PK'] },
  { slug: 'pentax-q', name: 'Pentax Q', brand: 'pentax' },
  { slug: 'samsung-nx', name: 'Samsung NX', brand: 'samsung' },
  { slug: 'samsung-nx-mini', name: 'Samsung NX mini', brand: 'samsung' },
  { slug: 'sigma-sa', name: 'Sigma SA', brand: 'sigma' },
  {
    slug: 'sony-a',
    name: 'Sony A',
    brand: 'sony',
    searchTerms: ['Alpha', 'Minolta AF', 'Dynax', 'Maxxum'],
  },
  { slug: 'sony-e', name: 'Sony E', brand: 'sony', searchTerms: ['FE', 'NEX'] },
  { slug: 'contax-yashica', name: 'Contax/Yashica', searchTerms: ['C/Y', 'CY'] },
  { slug: 'four-thirds', name: 'Four Thirds', searchTerms: ['4/3'] },
  { slug: 'l-mount', name: 'L-Mount', searchTerms: ['Leica L', 'Panasonic', 'Lumix S'] },
  { slug: 'm42', name: 'M42', searchTerms: ['Pentax Screw', 'Praktica', 'Zenit'] },
  {
    slug: 'micro-four-thirds',
    name: 'Micro Four Thirds',
    searchTerms: ['M43', 'MFT', 'M4/3', 'Micro 4/3', 'Olympus', 'Panasonic'],
  },
];

const CAMERAS: CameraSeed[] = [
  {
    brand: 'fujifilm',
    name: 'X-T3',
    mount: 'fujifilm-x',
    releaseYear: 2018,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 26.1,
  },
  {
    brand: 'fujifilm',
    name: 'X-T4',
    mount: 'fujifilm-x',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 26.1,
  },
  {
    brand: 'fujifilm',
    name: 'X-T5',
    mount: 'fujifilm-x',
    releaseYear: 2022,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 40.2,
  },
  {
    brand: 'fujifilm',
    name: 'X-T30 II',
    mount: 'fujifilm-x',
    releaseYear: 2021,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 26.1,
  },
  {
    brand: 'fujifilm',
    name: 'X-S10',
    mount: 'fujifilm-x',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 26.1,
  },
  {
    brand: 'fujifilm',
    name: 'X-H2',
    mount: 'fujifilm-x',
    releaseYear: 2022,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 40.2,
  },
  {
    brand: 'fujifilm',
    name: 'X100V',
    releaseYear: 2020,
    bodyType: 'compact',
    sensorFormat: 'aps_c',
    megapixels: 26.1,
  },
  {
    brand: 'canon',
    name: 'EOS R6',
    mount: 'canon-rf',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 20.1,
  },
  {
    brand: 'canon',
    name: 'EOS R6 Mark II',
    mount: 'canon-rf',
    releaseYear: 2022,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.2,
  },
  {
    brand: 'canon',
    name: 'EOS RP',
    mount: 'canon-rf',
    releaseYear: 2019,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 26.2,
  },
  {
    brand: 'canon',
    name: 'EOS R10',
    mount: 'canon-rf',
    releaseYear: 2022,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 24.2,
  },
  {
    brand: 'canon',
    name: 'EOS 5D Mark IV',
    mount: 'canon-ef',
    releaseYear: 2016,
    bodyType: 'dslr',
    sensorFormat: 'full_frame',
    megapixels: 30.4,
  },
  {
    brand: 'canon',
    name: 'EOS 90D',
    mount: 'canon-ef-s',
    releaseYear: 2019,
    bodyType: 'dslr',
    sensorFormat: 'aps_c',
    megapixels: 32.5,
  },
  {
    brand: 'canon',
    name: 'EOS M50 Mark II',
    mount: 'canon-ef-m',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 24.1,
  },
  {
    brand: 'nikon',
    name: 'Z6 II',
    mount: 'nikon-z',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.5,
  },
  {
    brand: 'nikon',
    name: 'Z5',
    mount: 'nikon-z',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.3,
  },
  {
    brand: 'nikon',
    name: 'D750',
    mount: 'nikon-f',
    releaseYear: 2014,
    bodyType: 'dslr',
    sensorFormat: 'full_frame',
    megapixels: 24.3,
  },
  {
    brand: 'nikon',
    name: 'D850',
    mount: 'nikon-f',
    releaseYear: 2017,
    bodyType: 'dslr',
    sensorFormat: 'full_frame',
    megapixels: 45.7,
  },
  {
    brand: 'sony',
    name: 'A7 III',
    mount: 'sony-e',
    releaseYear: 2018,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.2,
  },
  {
    brand: 'sony',
    name: 'A7 IV',
    mount: 'sony-e',
    releaseYear: 2021,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 33,
  },
  {
    brand: 'sony',
    name: 'A7C',
    mount: 'sony-e',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.2,
  },
  {
    brand: 'sony',
    name: 'A6400',
    mount: 'sony-e',
    releaseYear: 2019,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 24.2,
  },
  {
    brand: 'sony',
    name: 'A6700',
    mount: 'sony-e',
    releaseYear: 2023,
    bodyType: 'mirrorless',
    sensorFormat: 'aps_c',
    megapixels: 26,
  },
  {
    brand: 'sony',
    name: 'RX100 VII',
    releaseYear: 2019,
    bodyType: 'compact',
    sensorFormat: 'one_inch',
    megapixels: 20.1,
  },
  {
    brand: 'panasonic',
    name: 'Lumix S5 II',
    mount: 'l-mount',
    releaseYear: 2023,
    bodyType: 'mirrorless',
    sensorFormat: 'full_frame',
    megapixels: 24.2,
  },
  {
    brand: 'panasonic',
    name: 'Lumix GH5',
    mount: 'micro-four-thirds',
    releaseYear: 2017,
    bodyType: 'mirrorless',
    sensorFormat: 'micro_four_thirds',
    megapixels: 20.3,
  },
  {
    brand: 'olympus',
    name: 'OM-D E-M10 Mark IV',
    mount: 'micro-four-thirds',
    releaseYear: 2020,
    bodyType: 'mirrorless',
    sensorFormat: 'micro_four_thirds',
    megapixels: 20.3,
  },
  {
    brand: 'ricoh',
    name: 'GR III',
    releaseYear: 2018,
    bodyType: 'compact',
    sensorFormat: 'aps_c',
    megapixels: 24.2,
  },
  // Film bodies. 35mm film shares the full-frame capture area.
  {
    brand: 'zenit',
    name: 'TTL',
    mount: 'm42',
    releaseYear: 1977,
    bodyType: 'slr',
    sensorFormat: 'full_frame',
    isFilm: true,
  },
  {
    brand: 'canon',
    name: 'AE-1',
    mount: 'canon-fd',
    releaseYear: 1976,
    bodyType: 'slr',
    sensorFormat: 'full_frame',
    isFilm: true,
  },
  {
    brand: 'canon',
    name: 'Canonet QL17 GIII',
    releaseYear: 1972,
    bodyType: 'rangefinder',
    sensorFormat: 'full_frame',
    isFilm: true,
  },
  {
    brand: 'olympus',
    name: 'mju-II',
    releaseYear: 1997,
    bodyType: 'compact',
    sensorFormat: 'full_frame',
    isFilm: true,
  },
];

const LENSES: LensSeed[] = [
  {
    brand: 'fujifilm',
    name: 'XF 35mm f/1.4 R',
    mount: 'fujifilm-x',
    releaseYear: 2012,
    focal: [35, 35],
    maxAperture: 1.4,
    filterThreadMm: 52,
  },
  {
    brand: 'fujifilm',
    name: 'XF 18-55mm f/2.8-4 R LM OIS',
    mount: 'fujifilm-x',
    releaseYear: 2012,
    focal: [18, 55],
    maxAperture: 2.8,
    stabilized: true,
    filterThreadMm: 58,
  },
  {
    brand: 'fujifilm',
    name: 'XF 56mm f/1.2 R',
    mount: 'fujifilm-x',
    releaseYear: 2014,
    focal: [56, 56],
    maxAperture: 1.2,
    filterThreadMm: 62,
  },
  {
    brand: 'canon',
    name: 'RF 50mm f/1.8 STM',
    mount: 'canon-rf',
    releaseYear: 2020,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 43,
  },
  {
    brand: 'canon',
    name: 'EF 50mm f/1.8 STM',
    mount: 'canon-ef',
    releaseYear: 2015,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 49,
  },
  {
    brand: 'canon',
    name: 'EF 24-70mm f/2.8L II USM',
    mount: 'canon-ef',
    releaseYear: 2012,
    focal: [24, 70],
    maxAperture: 2.8,
    filterThreadMm: 82,
  },
  {
    brand: 'nikon',
    name: 'NIKKOR Z 50mm f/1.8 S',
    mount: 'nikon-z',
    releaseYear: 2018,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 62,
  },
  {
    brand: 'nikon',
    name: 'AF-S NIKKOR 24-70mm f/2.8E ED VR',
    mount: 'nikon-f',
    releaseYear: 2015,
    focal: [24, 70],
    maxAperture: 2.8,
    stabilized: true,
    filterThreadMm: 82,
  },
  {
    brand: 'sony',
    name: 'FE 50mm f/1.8',
    mount: 'sony-e',
    releaseYear: 2016,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 49,
  },
  {
    brand: 'sony',
    name: 'FE 24-70mm f/2.8 GM',
    mount: 'sony-e',
    releaseYear: 2016,
    focal: [24, 70],
    maxAperture: 2.8,
    filterThreadMm: 82,
  },
  {
    brand: 'sony',
    name: 'E 18-135mm f/3.5-5.6 OSS',
    mount: 'sony-e',
    releaseYear: 2018,
    focal: [18, 135],
    maxAperture: 3.5,
    stabilized: true,
    filterThreadMm: 55,
  },
  {
    brand: 'sigma',
    name: '35mm f/1.4 DG HSM Art',
    mount: 'canon-ef',
    releaseYear: 2012,
    focal: [35, 35],
    maxAperture: 1.4,
    filterThreadMm: 67,
  },
  {
    brand: 'sigma',
    name: '30mm f/1.4 DC DN Contemporary',
    mount: 'sony-e',
    releaseYear: 2016,
    focal: [30, 30],
    maxAperture: 1.4,
    filterThreadMm: 52,
  },
  {
    brand: 'sigma',
    name: '56mm f/1.4 DC DN Contemporary',
    mount: 'fujifilm-x',
    releaseYear: 2018,
    focal: [56, 56],
    maxAperture: 1.4,
    filterThreadMm: 55,
  },
  {
    brand: 'tamron',
    name: '28-75mm f/2.8 Di III VXD G2',
    mount: 'sony-e',
    releaseYear: 2021,
    focal: [28, 75],
    maxAperture: 2.8,
    filterThreadMm: 67,
  },
  {
    brand: 'samyang',
    name: '12mm f/2 NCS CS',
    mount: 'fujifilm-x',
    releaseYear: 2014,
    focal: [12, 12],
    maxAperture: 2,
    filterThreadMm: 67,
  },
  {
    brand: 'helios',
    name: '44-2 58mm f/2',
    mount: 'm42',
    releaseYear: 1975,
    focal: [58, 58],
    maxAperture: 2,
    filterThreadMm: 49,
  },
];

const ACCESSORIES: AccessorySeed[] = [
  { brand: 'smallrig', name: 'Cage for Sony A6500' },
  { brand: 'peak-design', name: 'Slide Camera Strap' },
  { brand: 'fujifilm', name: 'VG-XT4 Battery Grip', releaseYear: 2020 },
];

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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set — see .env.example');
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
