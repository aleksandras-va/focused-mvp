import { readFileSync } from 'node:fs';
import {
  type ImportedLens,
  lensKey,
  STABILIZATION_MARKER,
  slugify,
  sortLenses,
  writeSeedData,
} from './lens-seed-data.mts';

type LensRow = {
  name: string;
  brand: string;
  mounts: string[];
  focal: string;
  aperture: string;
  year: string;
  weight: string;
};

const BRAND_BY_LISTED_BRAND: Record<string, { slug: string; name: string }> = {
  'Carl Zeiss': { slug: 'zeiss', name: 'Zeiss' },
  Cosina: { slug: 'voigtlander', name: 'Voigtlander' },
  Fuji: { slug: 'fujifilm', name: 'Fujifilm' },
  Laowa: { slug: 'laowa', name: 'Laowa' },
  Leitz: { slug: 'leica', name: 'Leica' },
  LK: { slug: 'samyang', name: 'Samyang' },
  'Meyer-Optik Görlitz': { slug: 'meyer-optik-gorlitz', name: 'Meyer-Optik Gorlitz' },
  'MS-Optics': { slug: 'ms-optics', name: 'MS Optics' },
  SELENA: { slug: 'selena', name: 'Selena' },
  Venus: { slug: 'laowa', name: 'Laowa' },
  Voigtländer: { slug: 'voigtlander', name: 'Voigtlander' },
};

const SKIPPED_LISTED_BRANDS = new Set(['Rokinon']);

const MOUNT_BY_LISTED_MOUNT: Record<string, string> = {
  'Canon EF': 'canon-ef',
  'Canon EF-M': 'canon-ef-m',
  'Canon RF': 'canon-rf',
  'Fujifilm G': 'fujifilm-g',
  'Fujifilm X': 'fujifilm-x',
  'Hasselblad X': 'hasselblad-x',
  'Leica L': 'l-mount',
  'Leica M': 'leica-m',
  'Leica Screw Mount (M39 / LTM)': 'leica-ltm',
  M42: 'm42',
  'Micro Four Thirds': 'micro-four-thirds',
  'Minolta/Sony A': 'sony-a',
  'Nikon 1': 'nikon-1',
  'Nikon F': 'nikon-f',
  'Nikon Z': 'nikon-z',
  'Pentax K': 'pentax-k',
  'Samsung NX': 'samsung-nx',
  'Sigma SA': 'sigma-sa',
  'Sony E': 'sony-e',
};

const MAKER_PREFIXES = [
  /^(cosina )?voigtlander /i,
  /^venus (optics )?/i,
  /^laowa /i,
  /^fujifilm /i,
  /^(super ebc )?fujinon /i,
  /^(carl )?zeiss /i,
  /^leitz wetzlar /i,
  /^meyer-optik gorlitz /i,
  /^artra lab /i,
  /^om system /i,
  /^lk samyang /i,
  /^lee works /i,
  /^peace lens /i,
];

const FINISH =
  /( (glossy black paint|bare brass|((\w+ )?(white|black|green|grey|red|gold|silver))|titanium))+$/i;

function text(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRows(html: string): LensRow[] {
  const rows: LensRow[] = [];

  for (const [row] of html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)) {
    const cells = [...row.matchAll(/<td\b[\s\S]*?<\/td>/g)].map(([cell]) => cell);
    if (cells.length !== 10) continue;

    rows.push({
      name: text(cells[0]),
      brand: text(cells[1]),
      mounts: (cells[2].match(/title="([^"]*)"/)?.[1] ?? '').replaceAll('&amp;', '&').split(', '),
      focal: text(cells[3]),
      aperture: text(cells[4]),
      year: text(cells[7]),
      weight: text(cells[9]),
    });
  }

  return rows;
}

function resolveBrand(row: LensRow): { slug: string; name: string } {
  if (row.name.startsWith('OM System')) return { slug: 'om-system', name: 'OM System' };
  return BRAND_BY_LISTED_BRAND[row.brand] ?? { slug: slugify(row.brand), name: row.brand };
}

function resolveName(row: LensRow): string {
  const withoutPrefix = MAKER_PREFIXES.reduce((name, prefix) => name.replace(prefix, ''), row.name);
  const withoutMaker = withoutPrefix.toLowerCase().startsWith(`${row.brand.toLowerCase()} `)
    ? withoutPrefix.slice(row.brand.length + 1)
    : withoutPrefix;
  const named = row.brand === 'Viltrox' ? viltroxName(withoutMaker) : withoutMaker;

  return named
    .replace(/–/g, '-')
    .replace(/\s*["“][^"”]*["”]/g, '')
    .replace(/\s*[[(](SEL|China Red|Rokinon|L-mount)[^\])]*[\])]/gi, '')
    .replace(/ \/ Rokinon .*$/, '')
    .replace(/ [ABF]\d{3}$/, '')
    .replace(/\s*\|\s*A\b/, ' Art')
    .replace(/\s*\|\s*C\b/, ' Contemporary')
    .replace(/\s*\|\s*S\b/, ' Sport')
    .replace(/^DX Nikkor Z\b/i, 'NIKKOR Z DX')
    .replace(/\bNikkor\b/i, 'NIKKOR')
    .replace(/\bLUMIX\b/, 'Lumix')
    .replace(/O\.I\.S\./, 'OIS')
    .replace(/\b[Ff]\/?(?=\d)/g, 'f/')
    .replace(/ Limited White Edition$/, '')
    .replace(FINISH, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function viltroxName(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/, '')
    .replace(/ (ASPH|ED|IF|STM|VCM)\b/g, '')
    .replace(/^(Air|EVO|LAB|Pro) (.*)$/, '$2 $1');
}

const htmlPath = process.argv[2];

if (!htmlPath) {
  throw new Error('Usage: pnpm db:import:lens-db <path to the saved lens table html>');
}

const skipped = { brand: 0, mount: 0, spec: 0, duplicate: 0 };
const lensesByKey = new Map<string, ImportedLens>();

for (const row of parseRows(readFileSync(htmlPath, 'utf8'))) {
  if (SKIPPED_LISTED_BRANDS.has(row.brand)) {
    skipped.brand++;
    continue;
  }

  const mounts = new Set(row.mounts.map((mount) => MOUNT_BY_LISTED_MOUNT[mount]).filter(Boolean));
  if (mounts.size === 0) {
    skipped.mount++;
    continue;
  }

  const [, focalMin, focalMax] = row.focal.match(/^([\d.]+)(?:-([\d.]+))?mm$/) ?? [];
  const maxAperture = Number(row.aperture.match(/^f\/([\d.]+)$/)?.[1]);
  if (!focalMin || !maxAperture) {
    skipped.spec++;
    continue;
  }

  const brand = resolveBrand(row);
  const name = resolveName(row);
  const releaseYear = Number(row.year) || undefined;
  const weightGrams = Number(row.weight.match(/^(\d+)g$/)?.[1]) || undefined;

  for (const mount of mounts) {
    const lens: ImportedLens = {
      brand: brand.slug,
      brandName: brand.name,
      name,
      mount,
      releaseYear,
      focal: [Number(focalMin), Number(focalMax ?? focalMin)],
      maxAperture,
      stabilized: STABILIZATION_MARKER.test(name),
      weightGrams,
    };

    if (lensesByKey.has(lensKey(lens))) {
      skipped.duplicate++;
      continue;
    }
    lensesByKey.set(lensKey(lens), lens);
  }
}

const imported = sortLenses(lensesByKey.values());
writeSeedData('lens-db-lenses.json', imported);

console.log(`Imported ${imported.length} lenses.`);
console.log('Skipped:', skipped);
