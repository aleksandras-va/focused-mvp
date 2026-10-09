import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ImportedLens = {
  brand: string;
  brandName?: string;
  name: string;
  mount: string;
  releaseYear?: number;
  focal: [number, number];
  maxAperture: number;
  stabilized: boolean;
  weightGrams?: number;
};

const WORD_CASING = [
  'APOLanthar',
  'APOSkopar',
  'APOSummicronM',
  'APOSummicronSL',
  'APOUltron',
  'Argus',
  'ASPH',
  'Aspherical',
  'atxi',
  'Aurora',
  'Biotar',
  'Black',
  'CADreamer',
  'CDDreamer',
  'CDreamer',
  'ColorSkopar',
  'Creator',
  'Distagon',
  'Elegant',
  'Fisheye',
  'Heliar',
  'Iberit',
  'Lite',
  'Macro',
  'Mini',
  'NIKKOR',
  'Noctilux',
  'NoctiluxM',
  'Nokton',
  'Nonikkor',
  'Otus',
  'Paint',
  'PentaxD',
  'PentaxDA',
  'Power',
  'Sonnar',
  'Speedmaster',
  'SummiluxM',
  'Ultron',
  'Varioprasma',
  'Zoom',
];

const CASING_BY_WORD = new Map(WORD_CASING.map((word) => [word.toLowerCase(), word]));

function withConsistentCasing(word: string): string {
  const casing = CASING_BY_WORD.get(word.replace(/[^A-Za-z]/g, '').toLowerCase());
  if (!casing) return word;

  let letter = 0;
  return word.replace(/[A-Za-z]/g, () => casing[letter++]);
}

function withoutTrailingZero(aperture: string): string {
  return aperture.replace(/(\d)\.0(?!\d)/g, '$1');
}

export function cleanModelName(name: string): string {
  return name
    .replace(/f\/[\d.]+(?:-[\d.]+)?/g, withoutTrailingZero)
    .split(' ')
    .map(withConsistentCasing)
    .join(' ');
}

export const STABILIZATION_MARKER = /\b(IS|VR|OSS|OIS|VC|OS)\b|O\.I\.S\./;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function lensKey(lens: Pick<ImportedLens, 'brand' | 'name' | 'mount'>): string {
  return slugify(`${lens.brand} ${lens.name} ${lens.mount}`);
}

export function sortLenses(lenses: Iterable<ImportedLens>): ImportedLens[] {
  return [...lenses].sort(
    (a, b) =>
      a.brand.localeCompare(b.brand) ||
      a.name.localeCompare(b.name, 'en', { numeric: true }) ||
      a.mount.localeCompare(b.mount),
  );
}

export function writeSeedData(file: string, rows: unknown[]): void {
  const dataDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(path.join(dataDirectory, file), `${JSON.stringify(rows, null, 2)}\n`);
}
