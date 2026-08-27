/**
 * Seeds the gear catalog. Idempotent — safe to re-run after adding models.
 *
 *   pnpm db:seed
 *
 * Model names follow how the manufacturer writes them; the permutations
 * people actually type live in `aliases`.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
// @next/env is CommonJS-only, so it has no named ESM exports.
import nextEnv from "@next/env";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import type { CameraBodyType, DB, SensorFormat } from "../src/db/types";

type BrandSeed = { slug: string; name: string };
type MountSeed = { slug: string; name: string; brand?: string };

type CameraSeed = {
  brand: string;
  name: string;
  mount?: string;
  releaseYear: number;
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat;
  megapixels: number;
  hasMechanicalShutter?: boolean;
  aliases: string[];
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
  aliases: string[];
};

const BRANDS: BrandSeed[] = [
  { slug: "canon", name: "Canon" },
  { slug: "fujifilm", name: "Fujifilm" },
  { slug: "nikon", name: "Nikon" },
  { slug: "olympus", name: "Olympus" },
  { slug: "panasonic", name: "Panasonic" },
  { slug: "ricoh", name: "Ricoh" },
  { slug: "samyang", name: "Samyang" },
  { slug: "sigma", name: "Sigma" },
  { slug: "sony", name: "Sony" },
  { slug: "tamron", name: "Tamron" },
];

const MOUNTS: MountSeed[] = [
  { slug: "canon-ef", name: "Canon EF", brand: "canon" },
  { slug: "canon-ef-m", name: "Canon EF-M", brand: "canon" },
  { slug: "canon-ef-s", name: "Canon EF-S", brand: "canon" },
  { slug: "canon-rf", name: "Canon RF", brand: "canon" },
  { slug: "fujifilm-x", name: "Fujifilm X", brand: "fujifilm" },
  { slug: "nikon-f", name: "Nikon F", brand: "nikon" },
  { slug: "nikon-z", name: "Nikon Z", brand: "nikon" },
  { slug: "sony-e", name: "Sony E", brand: "sony" },
  // No single brand owns these.
  { slug: "l-mount", name: "L-Mount" },
  { slug: "micro-four-thirds", name: "Micro Four Thirds" },
];

const CAMERAS: CameraSeed[] = [
  {
    brand: "fujifilm",
    name: "X-T3",
    mount: "fujifilm-x",
    releaseYear: 2018,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 26.1,
    aliases: ["Fuji XT3", "XT3", "Fuji X-T3", "Fujifilm XT-3", "X T3"],
  },
  {
    brand: "fujifilm",
    name: "X-T4",
    mount: "fujifilm-x",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 26.1,
    aliases: ["Fuji XT4", "XT4", "Fuji X-T4", "Fujifilm XT-4"],
  },
  {
    brand: "fujifilm",
    name: "X-T5",
    mount: "fujifilm-x",
    releaseYear: 2022,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 40.2,
    aliases: ["Fuji XT5", "XT5", "Fuji X-T5", "Fujifilm XT-5"],
  },
  {
    brand: "fujifilm",
    name: "X-T30 II",
    mount: "fujifilm-x",
    releaseYear: 2021,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 26.1,
    aliases: ["Fuji XT30 II", "XT30II", "X-T30 2", "Fuji X-T30 mark II"],
  },
  {
    brand: "fujifilm",
    name: "X-S10",
    mount: "fujifilm-x",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 26.1,
    aliases: ["Fuji XS10", "XS10", "Fuji X-S10"],
  },
  {
    brand: "fujifilm",
    name: "X-H2",
    mount: "fujifilm-x",
    releaseYear: 2022,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 40.2,
    aliases: ["Fuji XH2", "XH2", "Fuji X-H2"],
  },
  {
    brand: "fujifilm",
    name: "X100V",
    releaseYear: 2020,
    bodyType: "compact",
    sensorFormat: "aps_c",
    megapixels: 26.1,
    aliases: ["Fuji X100V", "X100 V", "Fujifilm X100-V"],
  },
  {
    brand: "canon",
    name: "EOS R6",
    mount: "canon-rf",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 20.1,
    aliases: ["Canon R6", "R6", "Canon EOS R6"],
  },
  {
    brand: "canon",
    name: "EOS R6 Mark II",
    mount: "canon-rf",
    releaseYear: 2022,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.2,
    aliases: ["Canon R6 II", "R6 Mark 2", "R6II", "Canon EOS R6 mk2"],
  },
  {
    brand: "canon",
    name: "EOS RP",
    mount: "canon-rf",
    releaseYear: 2019,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 26.2,
    aliases: ["Canon RP", "RP", "Canon EOS RP"],
  },
  {
    brand: "canon",
    name: "EOS R10",
    mount: "canon-rf",
    releaseYear: 2022,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 24.2,
    aliases: ["Canon R10", "R10", "Canon EOS R10"],
  },
  {
    brand: "canon",
    name: "EOS 5D Mark IV",
    mount: "canon-ef",
    releaseYear: 2016,
    bodyType: "dslr",
    sensorFormat: "full_frame",
    megapixels: 30.4,
    aliases: ["Canon 5D4", "5D Mark 4", "5DIV", "Canon 5D IV", "5D mk4"],
  },
  {
    brand: "canon",
    name: "EOS 90D",
    mount: "canon-ef-s",
    releaseYear: 2019,
    bodyType: "dslr",
    sensorFormat: "aps_c",
    megapixels: 32.5,
    aliases: ["Canon 90D", "90D", "Canon EOS 90D"],
  },
  {
    brand: "canon",
    name: "EOS M50 Mark II",
    mount: "canon-ef-m",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 24.1,
    aliases: ["Canon M50 II", "M50 Mark 2", "M50II", "Canon EOS M50 mk2"],
  },
  {
    brand: "nikon",
    name: "Z6 II",
    mount: "nikon-z",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.5,
    aliases: ["Nikon Z6II", "Z6 2", "Nikon Z6 mark II"],
  },
  {
    brand: "nikon",
    name: "Z5",
    mount: "nikon-z",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.3,
    aliases: ["Nikon Z5", "Z 5"],
  },
  {
    brand: "nikon",
    name: "D750",
    mount: "nikon-f",
    releaseYear: 2014,
    bodyType: "dslr",
    sensorFormat: "full_frame",
    megapixels: 24.3,
    aliases: ["Nikon D750", "D 750"],
  },
  {
    brand: "nikon",
    name: "D850",
    mount: "nikon-f",
    releaseYear: 2017,
    bodyType: "dslr",
    sensorFormat: "full_frame",
    megapixels: 45.7,
    aliases: ["Nikon D850", "D 850"],
  },
  {
    brand: "sony",
    name: "A7 III",
    mount: "sony-e",
    releaseYear: 2018,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.2,
    aliases: [
      "Sony A7III",
      "A7 mark III",
      "a7iii",
      "Sony Alpha 7 III",
      "ILCE-7M3",
      "A7 3",
    ],
  },
  {
    brand: "sony",
    name: "A7 IV",
    mount: "sony-e",
    releaseYear: 2021,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 33,
    aliases: ["Sony A7IV", "A7 mark IV", "a7iv", "ILCE-7M4", "A7 4"],
  },
  {
    brand: "sony",
    name: "A7C",
    mount: "sony-e",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.2,
    aliases: ["Sony A7C", "Alpha 7C", "ILCE-7C"],
  },
  {
    brand: "sony",
    name: "A6400",
    mount: "sony-e",
    releaseYear: 2019,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 24.2,
    aliases: ["Sony A6400", "a6400", "Alpha 6400", "ILCE-6400"],
  },
  {
    brand: "sony",
    name: "A6700",
    mount: "sony-e",
    releaseYear: 2023,
    bodyType: "mirrorless",
    sensorFormat: "aps_c",
    megapixels: 26,
    aliases: ["Sony A6700", "a6700", "Alpha 6700", "ILCE-6700"],
  },
  {
    brand: "sony",
    name: "RX100 VII",
    releaseYear: 2019,
    bodyType: "compact",
    sensorFormat: "one_inch",
    megapixels: 20.1,
    aliases: ["Sony RX100 VII", "RX100M7", "RX100 7", "DSC-RX100M7"],
  },
  {
    brand: "panasonic",
    name: "Lumix S5 II",
    mount: "l-mount",
    releaseYear: 2023,
    bodyType: "mirrorless",
    sensorFormat: "full_frame",
    megapixels: 24.2,
    aliases: ["Panasonic S5 II", "Lumix S5II", "S5 2", "DC-S5M2"],
  },
  {
    brand: "panasonic",
    name: "Lumix GH5",
    mount: "micro-four-thirds",
    releaseYear: 2017,
    bodyType: "mirrorless",
    sensorFormat: "micro_four_thirds",
    megapixels: 20.3,
    aliases: ["Panasonic GH5", "GH5", "Lumix GH-5", "DC-GH5"],
  },
  {
    brand: "olympus",
    name: "OM-D E-M10 Mark IV",
    mount: "micro-four-thirds",
    releaseYear: 2020,
    bodyType: "mirrorless",
    sensorFormat: "micro_four_thirds",
    megapixels: 20.3,
    aliases: ["Olympus EM10 IV", "E-M10 IV", "OMD EM10 mark 4", "EM10IV"],
  },
  {
    brand: "ricoh",
    name: "GR III",
    releaseYear: 2018,
    bodyType: "compact",
    sensorFormat: "aps_c",
    megapixels: 24.2,
    aliases: ["Ricoh GR3", "GR III", "GRIII", "Ricoh GR 3"],
  },
];

const LENSES: LensSeed[] = [
  {
    brand: "fujifilm",
    name: "XF 35mm f/1.4 R",
    mount: "fujifilm-x",
    releaseYear: 2012,
    focal: [35, 35],
    maxAperture: 1.4,
    filterThreadMm: 52,
    aliases: [
      "Fuji 35mm 1.4",
      "XF35mmF1.4",
      "Fujinon 35 1.4",
      "Fuji XF 35 1.4",
    ],
  },
  {
    brand: "fujifilm",
    name: "XF 18-55mm f/2.8-4 R LM OIS",
    mount: "fujifilm-x",
    releaseYear: 2012,
    focal: [18, 55],
    maxAperture: 2.8,
    stabilized: true,
    filterThreadMm: 58,
    aliases: ["Fuji 18-55", "XF18-55", "Fujinon 18-55mm", "Fuji kit 18-55"],
  },
  {
    brand: "fujifilm",
    name: "XF 56mm f/1.2 R",
    mount: "fujifilm-x",
    releaseYear: 2014,
    focal: [56, 56],
    maxAperture: 1.2,
    filterThreadMm: 62,
    aliases: ["Fuji 56mm 1.2", "XF56mmF1.2", "Fujinon 56 1.2"],
  },
  {
    brand: "canon",
    name: "RF 50mm f/1.8 STM",
    mount: "canon-rf",
    releaseYear: 2020,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 43,
    aliases: ["Canon RF 50 1.8", "RF50mm STM", "Canon RF nifty fifty"],
  },
  {
    brand: "canon",
    name: "EF 50mm f/1.8 STM",
    mount: "canon-ef",
    releaseYear: 2015,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 49,
    aliases: ["Canon 50mm 1.8 STM", "EF50 STM", "nifty fifty", "Canon 50 1.8"],
  },
  {
    brand: "canon",
    name: "EF 24-70mm f/2.8L II USM",
    mount: "canon-ef",
    releaseYear: 2012,
    focal: [24, 70],
    maxAperture: 2.8,
    filterThreadMm: 82,
    aliases: ["Canon 24-70 2.8 II", "24-70L II", "Canon EF 24-70mm L 2"],
  },
  {
    brand: "nikon",
    name: "NIKKOR Z 50mm f/1.8 S",
    mount: "nikon-z",
    releaseYear: 2018,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 62,
    aliases: ["Nikon Z 50mm 1.8", "Z 50 1.8 S", "Nikkor Z50mm"],
  },
  {
    brand: "nikon",
    name: "AF-S NIKKOR 24-70mm f/2.8E ED VR",
    mount: "nikon-f",
    releaseYear: 2015,
    focal: [24, 70],
    maxAperture: 2.8,
    stabilized: true,
    filterThreadMm: 82,
    aliases: ["Nikon 24-70 VR", "Nikkor 24-70mm 2.8E", "Nikon 2470 VR"],
  },
  {
    brand: "sony",
    name: "FE 50mm f/1.8",
    mount: "sony-e",
    releaseYear: 2016,
    focal: [50, 50],
    maxAperture: 1.8,
    filterThreadMm: 49,
    aliases: ["Sony 50mm 1.8", "SEL50F18F", "Sony FE 50 1.8"],
  },
  {
    brand: "sony",
    name: "FE 24-70mm f/2.8 GM",
    mount: "sony-e",
    releaseYear: 2016,
    focal: [24, 70],
    maxAperture: 2.8,
    filterThreadMm: 82,
    aliases: ["Sony 24-70 GM", "2470GM", "SEL2470GM", "Sony FE 24-70mm GM"],
  },
  {
    brand: "sony",
    name: "E 18-135mm f/3.5-5.6 OSS",
    mount: "sony-e",
    releaseYear: 2018,
    focal: [18, 135],
    maxAperture: 3.5,
    stabilized: true,
    filterThreadMm: 55,
    aliases: ["Sony 18-135", "SEL18135", "Sony E 18-135mm OSS"],
  },
  {
    brand: "sigma",
    name: "35mm f/1.4 DG HSM Art",
    mount: "canon-ef",
    releaseYear: 2012,
    focal: [35, 35],
    maxAperture: 1.4,
    filterThreadMm: 67,
    aliases: [
      "Sigma 35 Art EF",
      "Sigma 35mm 1.4 Art Canon",
      "Sigma 35 1.4 HSM",
    ],
  },
  {
    brand: "sigma",
    name: "30mm f/1.4 DC DN Contemporary",
    mount: "sony-e",
    releaseYear: 2016,
    focal: [30, 30],
    maxAperture: 1.4,
    filterThreadMm: 52,
    aliases: [
      "Sigma 30mm 1.4 Sony",
      "Sigma 30 DC DN E",
      "Sigma 30mm Contemporary E",
    ],
  },
  {
    brand: "sigma",
    name: "56mm f/1.4 DC DN Contemporary",
    mount: "fujifilm-x",
    releaseYear: 2018,
    focal: [56, 56],
    maxAperture: 1.4,
    filterThreadMm: 55,
    aliases: ["Sigma 56mm 1.4 Fuji", "Sigma 56 DC DN X", "Sigma 56mm X-mount"],
  },
  {
    brand: "tamron",
    name: "28-75mm f/2.8 Di III VXD G2",
    mount: "sony-e",
    releaseYear: 2021,
    focal: [28, 75],
    maxAperture: 2.8,
    filterThreadMm: 67,
    aliases: ["Tamron 28-75 G2", "Tamron 2875 G2", "Tamron 28-75mm 2.8 gen 2"],
  },
  {
    brand: "samyang",
    name: "12mm f/2.0 NCS CS",
    mount: "fujifilm-x",
    releaseYear: 2014,
    focal: [12, 12],
    maxAperture: 2,
    filterThreadMm: 67,
    aliases: ["Samyang 12mm 2.0 Fuji", "Samyang 12 F2 X", "Rokinon 12mm f2"],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

nextEnv.loadEnvConfig(projectRoot);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString }) }),
});

await db.transaction().execute(async (trx) => {
  const brandIds = new Map<string, string>();
  for (const brand of BRANDS) {
    const row = await trx
      .insertInto("brands")
      .values(brand)
      .onConflict((oc) => oc.column("slug").doUpdateSet({ name: brand.name }))
      .returning(["id", "slug"])
      .executeTakeFirstOrThrow();
    brandIds.set(row.slug, row.id);
  }

  const mountIds = new Map<string, string>();
  for (const mount of MOUNTS) {
    const row = await trx
      .insertInto("mounts")
      .values({
        slug: mount.slug,
        name: mount.name,
        brand_id: mount.brand ? brandIds.get(mount.brand) : null,
      })
      .onConflict((oc) => oc.column("slug").doUpdateSet({ name: mount.name }))
      .returning(["id", "slug"])
      .executeTakeFirstOrThrow();
    mountIds.set(row.slug, row.id);
  }

  const brandNames = new Map(BRANDS.map((b) => [b.slug, b.name]));

  async function upsertModel(
    entry: { brand: string; name: string; mount?: string; releaseYear: number },
    category: "camera" | "lens",
    aliases: string[],
  ): Promise<string> {
    const brandId = brandIds.get(entry.brand);
    if (!brandId) throw new Error(`Unknown brand: ${entry.brand}`);

    const mountId = entry.mount ? mountIds.get(entry.mount) : null;
    if (entry.mount && !mountId)
      throw new Error(`Unknown mount: ${entry.mount}`);

    const slug = slugify(`${entry.brand} ${entry.name}`);

    const model = await trx
      .insertInto("models")
      .values({
        category,
        brand_id: brandId,
        mount_id: mountId,
        name: entry.name,
        slug,
        release_year: entry.releaseYear,
      })
      .onConflict((oc) =>
        oc.column("slug").doUpdateSet({
          release_year: entry.releaseYear,
          updated_at: new Date(),
        }),
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    // The canonical alias is the display name: "Fujifilm X-T3".
    const canonical = `${brandNames.get(entry.brand)} ${entry.name}`;
    const rows = [
      { model_id: model.id, alias: canonical, is_canonical: true },
      ...aliases.map((alias) => ({
        model_id: model.id,
        alias,
        is_canonical: false,
      })),
    ];

    for (const row of rows) {
      await trx
        .insertInto("model_aliases")
        .values(row)
        // `normalized` is generated, so conflicts are on the normalised form —
        // "Fujifilm X-T3" and "Fujifilm XT-3" are the same row. Never let a
        // later duplicate demote the canonical alias.
        .onConflict((oc) =>
          oc.columns(["model_id", "normalized"]).doUpdateSet({
            is_canonical: sql<boolean>`model_aliases.is_canonical or excluded.is_canonical`,
          }),
        )
        .execute();
    }

    return model.id;
  }

  for (const camera of CAMERAS) {
    const modelId = await upsertModel(camera, "camera", camera.aliases);
    await trx
      .insertInto("camera_specs")
      .values({
        model_id: modelId,
        body_type: camera.bodyType,
        sensor_format: camera.sensorFormat,
        megapixels: camera.megapixels,
        has_mechanical_shutter: camera.hasMechanicalShutter ?? true,
      })
      .onConflict((oc) =>
        oc.column("model_id").doUpdateSet({
          body_type: camera.bodyType,
          sensor_format: camera.sensorFormat,
          megapixels: camera.megapixels,
        }),
      )
      .execute();
  }

  for (const lens of LENSES) {
    const modelId = await upsertModel(lens, "lens", lens.aliases);
    await trx
      .insertInto("lens_specs")
      .values({
        model_id: modelId,
        focal_min_mm: lens.focal[0],
        focal_max_mm: lens.focal[1],
        max_aperture: lens.maxAperture,
        has_stabilization: lens.stabilized ?? false,
        filter_thread_mm: lens.filterThreadMm ?? null,
      })
      .onConflict((oc) =>
        oc.column("model_id").doUpdateSet({
          focal_min_mm: lens.focal[0],
          focal_max_mm: lens.focal[1],
          max_aperture: lens.maxAperture,
        }),
      )
      .execute();
  }
});

const [{ models, aliases }] = await db
  .selectFrom("models")
  .select((eb) => [
    eb.fn.countAll<number>().as("models"),
    eb
      .selectFrom("model_aliases")
      .select((inner) => inner.fn.countAll<number>().as("c"))
      .as("aliases"),
  ])
  .execute();

console.log(`Seeded ${models} models with ${aliases} aliases.`);

await db.destroy();
