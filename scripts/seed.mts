/**
 * Seeds the gear catalog. Idempotent — safe to re-run after adding model.
 *
 *   pnpm db:seed
 *
 * Model names follow how the manufacturer writes them; the permutations
 * people actually type live in `aliases`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @next/env is CommonJS-only, so it has no named ESM exports.
import nextEnv from '@next/env';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { CameraBodyType, DB, SensorFormat } from '../src/db/types';

type BrandSeed = { slug: string; name: string };
type MountSeed = { slug: string; name: string; brand?: string };

type CameraSeed = {
  brand: string;
  name: string;
  mount?: string;
  releaseYear: number;
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat;
  megapixels?: number;
  hasMechanicalShutter?: boolean;
  isFilm?: boolean;
};

type LensSeed = {
  brand: string;
  name: string;
  mount: string;
  releaseYear: number;
  focal: [number, number];
  maxAperture: number;
  stabilized?: boolean;
  filterThreadMm?: number;
};

type AccessorySeed = {
  brand: string;
  name: string;
  releaseYear?: number;
};

const BRANDS: BrandSeed[] = [
  { slug: 'canon', name: 'Canon' },
  { slug: 'fujifilm', name: 'Fujifilm' },
  { slug: 'helios', name: 'Helios' },
  { slug: 'nikon', name: 'Nikon' },
  { slug: 'olympus', name: 'Olympus' },
  { slug: 'panasonic', name: 'Panasonic' },
  { slug: 'peak-design', name: 'Peak Design' },
  { slug: 'ricoh', name: 'Ricoh' },
  { slug: 'samyang', name: 'Samyang' },
  { slug: 'sigma', name: 'Sigma' },
  { slug: 'smallrig', name: 'SmallRig' },
  { slug: 'sony', name: 'Sony' },
  { slug: 'tamron', name: 'Tamron' },
  { slug: 'zenit', name: 'Zenit' },
];

const MOUNTS: MountSeed[] = [
  { slug: 'canon-ef', name: 'Canon EF', brand: 'canon' },
  { slug: 'canon-ef-m', name: 'Canon EF-M', brand: 'canon' },
  { slug: 'canon-ef-s', name: 'Canon EF-S', brand: 'canon' },
  { slug: 'canon-fd', name: 'Canon FD', brand: 'canon' },
  { slug: 'canon-rf', name: 'Canon RF', brand: 'canon' },
  { slug: 'fujifilm-x', name: 'Fujifilm X', brand: 'fujifilm' },
  { slug: 'nikon-f', name: 'Nikon F', brand: 'nikon' },
  { slug: 'nikon-z', name: 'Nikon Z', brand: 'nikon' },
  { slug: 'sony-e', name: 'Sony E', brand: 'sony' },
  // No single brand owns these.
  { slug: 'l-mount', name: 'L-Mount' },
  { slug: 'm42', name: 'M42' },
  { slug: 'micro-four-thirds', name: 'Micro Four Thirds' },
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
    name: '12mm f/2.0 NCS CS',
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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set — see .env.example');
}

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString }) }),
});

await db.transaction().execute(async (trx) => {
  const brandIds = new Map<string, string>();
  for (const brand of BRANDS) {
    const row = await trx
      .insertInto('brand')
      .values(brand)
      .onConflict((oc) => oc.column('slug').doUpdateSet({ name: brand.name }))
      .returning(['id', 'slug'])
      .executeTakeFirstOrThrow();
    brandIds.set(row.slug, row.id);
  }

  const mountIds = new Map<string, string>();
  for (const mount of MOUNTS) {
    const row = await trx
      .insertInto('mount')
      .values({
        slug: mount.slug,
        name: mount.name,
        brand_id: mount.brand ? brandIds.get(mount.brand) : null,
      })
      .onConflict((oc) => oc.column('slug').doUpdateSet({ name: mount.name }))
      .returning(['id', 'slug'])
      .executeTakeFirstOrThrow();
    mountIds.set(row.slug, row.id);
  }

  const brandNames = new Map(BRANDS.map((b) => [b.slug, b.name]));

  async function upsertModel(
    entry: { brand: string; name: string; mount?: string; releaseYear?: number },
    category: 'camera' | 'lens' | 'accessory',
  ): Promise<string> {
    const brandId = brandIds.get(entry.brand);
    if (!brandId) throw new Error(`Unknown brand: ${entry.brand}`);

    const mountId = entry.mount ? mountIds.get(entry.mount) : null;
    if (entry.mount && !mountId) throw new Error(`Unknown mount: ${entry.mount}`);

    const slug = slugify(`${entry.brand} ${entry.name}`);
    const displayName = `${brandNames.get(entry.brand)} ${entry.name}`;

    const model = await trx
      .insertInto('model')
      .values({
        category,
        brand_id: brandId,
        mount_id: mountId,
        name: entry.name,
        display_name: displayName,
        slug,
        release_year: entry.releaseYear ?? null,
      })
      .onConflict((oc) =>
        oc.column('slug').doUpdateSet({
          display_name: displayName,
          release_year: entry.releaseYear ?? null,
          updated_at: new Date(),
        }),
      )
      .returning('id')
      .executeTakeFirstOrThrow();

    return model.id;
  }

  for (const camera of CAMERAS) {
    const modelId = await upsertModel(camera, 'camera');
    await trx
      .insertInto('camera_spec')
      .values({
        model_id: modelId,
        body_type: camera.bodyType,
        sensor_format: camera.sensorFormat,
        megapixels: camera.megapixels ?? null,
        has_mechanical_shutter: camera.hasMechanicalShutter ?? true,
        is_film: camera.isFilm ?? false,
      })
      .onConflict((oc) =>
        oc.column('model_id').doUpdateSet({
          body_type: camera.bodyType,
          sensor_format: camera.sensorFormat,
          megapixels: camera.megapixels ?? null,
          is_film: camera.isFilm ?? false,
        }),
      )
      .execute();
  }

  for (const lens of LENSES) {
    const modelId = await upsertModel(lens, 'lens');
    await trx
      .insertInto('lens_spec')
      .values({
        model_id: modelId,
        focal_min_mm: lens.focal[0],
        focal_max_mm: lens.focal[1],
        max_aperture: lens.maxAperture,
        has_stabilization: lens.stabilized ?? false,
        filter_thread_mm: lens.filterThreadMm ?? null,
      })
      .onConflict((oc) =>
        oc.column('model_id').doUpdateSet({
          focal_min_mm: lens.focal[0],
          focal_max_mm: lens.focal[1],
          max_aperture: lens.maxAperture,
        }),
      )
      .execute();
  }

  for (const accessory of ACCESSORIES) {
    await upsertModel(accessory, 'accessory');
  }
});

const [{ total }] = await db
  .selectFrom('model')
  .select((eb) => eb.fn.countAll<number>().as('total'))
  .execute();

console.log(`Seeded ${total} models.`);

await db.destroy();
