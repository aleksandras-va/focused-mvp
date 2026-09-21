/**
 * Seeds the city list sellers pick from. Idempotent — safe to re-run.
 *
 *   pnpm db:seed:cities
 *
 * Order follows population, the way Lithuanian classifieds list them, and is
 * what `position` preserves. Names stay in Lithuanian because they are proper
 * nouns; "Other" is the one entry that is not.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @next/env is CommonJS-only, so it has no named ESM exports.
import nextEnv from '@next/env';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from '../src/db/types';

const CITIES = [
  'Vilnius',
  'Vilniaus r.',
  'Kaunas',
  'Kauno r.',
  'Klaipėda',
  'Klaipėdos r.',
  'Šiauliai',
  'Šiaulių r.',
  'Panevėžys',
  'Panevėžio r.',
  'Alytus',
  'Alytaus r.',
  'Akmenės r.',
  'Anykščių r.',
  'Birštonas',
  'Biržų r.',
  'Druskininkai',
  'Elektrėnai',
  'Ignalinos r.',
  'Jonavos r.',
  'Joniškio r.',
  'Jurbarko r.',
  'Kaišiadorių r.',
  'Kalvarija',
  'Kazlų Rūda',
  'Kėdainių r.',
  'Kelmės r.',
  'Kretingos r.',
  'Kupiškio r.',
  'Lazdijų r.',
  'Marijampolė',
  'Mažeikių r.',
  'Molėtų r.',
  'Neringa',
  'Pagėgiai',
  'Pakruojo r.',
  'Palanga',
  'Pasvalio r.',
  'Plungės r.',
  'Prienų r.',
  'Radviliškio r.',
  'Raseinių r.',
  'Rietavas',
  'Rokiškio r.',
  'Skuodo r.',
  'Šakių r.',
  'Šalčininkų r.',
  'Šilalės r.',
  'Šilutės r.',
  'Širvintų r.',
  'Švenčionių r.',
  'Tauragės r.',
  'Telšių r.',
  'Trakų r.',
  'Ukmergės r.',
  'Utenos r.',
  'Varėnos r.',
  'Vilkaviškio r.',
  'Visaginas',
  'Zarasų r.',
  'Other',
];

const LITHUANIAN_LETTERS: Record<string, string> = {
  ą: 'a',
  č: 'c',
  ę: 'e',
  ė: 'e',
  į: 'i',
  š: 's',
  ų: 'u',
  ū: 'u',
  ž: 'z',
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (letter) => LITHUANIAN_LETTERS[letter])
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

await db
  .insertInto('city')
  .values(CITIES.map((name, position) => ({ slug: slugify(name), name, position })))
  .onConflict((oc) =>
    oc.column('slug').doUpdateSet((eb) => ({
      name: eb.ref('excluded.name'),
      position: eb.ref('excluded.position'),
    })),
  )
  .execute();

const [{ total }] = await db
  .selectFrom('city')
  .select((eb) => eb.fn.countAll<number>().as('total'))
  .execute();

console.log(`Seeded ${total} cities.`);

await db.destroy();
