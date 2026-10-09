import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { CameraBodyType, SensorFormat } from '../src/db/types';
import {
  cleanModelName,
  type ImportedLens,
  lensKey,
  STABILIZATION_MARKER,
  sortLenses,
  writeSeedData,
} from './lens-seed-data.mts';

type LensfunCamera = {
  file: string;
  maker: string;
  model: string;
  englishModel?: string;
  mount: string;
  cropFactor: number;
};

type ImportedCamera = {
  brand: string;
  name: string;
  mount?: string;
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat | null;
  searchTerms?: string[];
};

const BODY_TYPE_BY_FILE_PREFIX: [string, CameraBodyType][] = [
  ['rf-leica', 'rangefinder'],
  ['slr-', 'dslr'],
  ['mil-', 'mirrorless'],
  ['om-system', 'mirrorless'],
  ['compact-', 'compact'],
];

const BRAND_BY_MAKER_PREFIX: [string, string][] = [
  ['canon', 'canon'],
  ['casio', 'casio'],
  ['fujifilm', 'fujifilm'],
  ['hasselblad', 'hasselblad'],
  ['konica minolta', 'konica-minolta'],
  ['leica', 'leica'],
  ['minolta', 'minolta'],
  ['nikon', 'nikon'],
  ['olympus', 'olympus'],
  ['om digital', 'om-system'],
  ['panasonic', 'panasonic'],
  ['pentax', 'pentax'],
  ['ricoh', 'ricoh'],
  ['samsung', 'samsung'],
  ['sigma', 'sigma'],
  ['sony', 'sony'],
];

const MOUNT_BY_LENSFUN_MOUNT: Record<string, string> = {
  '4/3 System': 'four-thirds',
  'Canon EF': 'canon-ef',
  'Canon EF-M': 'canon-ef-m',
  'Canon EF-S': 'canon-ef-s',
  'Canon RF': 'canon-rf',
  'Fujifilm G': 'fujifilm-g',
  'Fujifilm X': 'fujifilm-x',
  'Hasselblad X': 'hasselblad-x',
  'Leica L': 'l-mount',
  'Leica M': 'leica-m',
  'Micro 4/3 System': 'micro-four-thirds',
  'Minolta AF': 'sony-a',
  'Nikon CX': 'nikon-1',
  'Nikon F AF': 'nikon-f',
  'Nikon Z': 'nikon-z',
  'Pentax 645AF2': 'pentax-645',
  'Pentax KAF2': 'pentax-k',
  'Pentax KAF4': 'pentax-k',
  'Pentax Q': 'pentax-q',
  'Samsung NX': 'samsung-nx',
  'Samsung NX mini': 'samsung-nx-mini',
  'Sigma SA': 'sigma-sa',
  'Sony Alpha': 'sony-a',
  'Sony E': 'sony-e',
};

const SENSOR_FORMAT_BY_MAX_CROP_FACTOR: [number, SensorFormat][] = [
  [0.9, 'medium_format'],
  [1.1, 'full_frame'],
  [1.8, 'aps_c'],
  [2.25, 'micro_four_thirds'],
  [2.8, 'one_inch'],
];

const MAKER_PREFIX =
  /^(canon|fujifilm|hasselblad|leica|nikon|olympus|panasonic|pentax|ricoh|samsung|sigma|sony)\s+/i;

const SKIPPED_LENSFUN_MODELS = new Set([
  'DC-GX7MK3',
  'DC-L10',
  'mju-II',
  'Nikon Z5_2C',
  'PEN',
  'Stylus Epic',
]);

const SKIPPED_NAMES = [
  /\b(kiss|rebel)\b/i,
  /^35mm film/,
  /^DCS/,
  /^EOS (Hi|D2000|8000D|9000D)$/,
  /^Maxxum/,
  /^A\d+A$/,
  /^A99V$/,
  /^Lumix ZS/,
  /^IXY/,
  /^PowerShot (SD\d|ELPH)/,
  /^Galaxy (S\d|Note)/,
  /^Cyber-shot$/,
  /^Xperia/,
  /^Stylus Verve/,
  /^D-360L$/,
];

const NAME_OVERRIDES: Record<string, string> = {
  'fujifilm/FinePix2800ZOOM': 'FinePix 2800 Zoom',
  'hasselblad/CFV 100C/907X': '907X & CFV 100C',
  'hasselblad/CFV II 50C/907X': '907X 50C',
  'leica/C-Lux (Typ 1546)': 'C-Lux',
  'leica/CL (Typ 7323)': 'CL',
  'olympus/µ-mini Digital': 'mju-mini Digital',
  'pentax/K-1 II': 'K-1 Mark II',
  'pentax/K-3 III': 'K-3 Mark III',
  'pentax/K-3 III Monochrome': 'K-3 Mark III Monochrome',
};

const MODEL_CODE = /^(ILCE|ILCA|ILME|SLT|DSLR|DSC|DMC|DC)-/;

const BODY_TYPE_OVERRIDES: Record<string, CameraBodyType> = {
  'leica/Digilux 3': 'dslr',
  'leica/M EV1': 'mirrorless',
  'pentax/K-01': 'mirrorless',
};

const MOUNT_OVERRIDES: Record<string, string> = {
  'leica/Digilux 3': 'four-thirds',
};

const ASPECT_RATIO_SUFFIX = /\s*\(?(3:2|4:3|16:9)\)?$/;

function parseCameras(file: string, xml: string): LensfunCamera[] {
  const withoutComments = xml.replace(/<!--[\s\S]*?-->/g, '');
  const cameras: LensfunCamera[] = [];

  for (const [, block] of withoutComments.matchAll(/<camera>([\s\S]*?)<\/camera>/g)) {
    const text = (pattern: RegExp) => block.match(pattern)?.[1].replaceAll('&amp;', '&').trim();
    const maker = text(/<maker>([^<]*)<\/maker>/);
    const model = text(/<model>([^<]*)<\/model>/);
    const cropFactor = Number(text(/<cropfactor>([^<]*)<\/cropfactor>/));
    if (!maker || !model || !Number.isFinite(cropFactor)) continue;

    cameras.push({
      file,
      maker,
      model,
      englishModel: text(/<model lang="en">([^<]*)<\/model>/),
      mount: text(/<mount>([^<]*)<\/mount>/) ?? '',
      cropFactor,
    });
  }

  return cameras;
}

function resolveBrand(camera: LensfunCamera): string | undefined {
  if (/^pentax /i.test(camera.model)) return 'pentax';
  const maker = camera.maker.toLowerCase();
  return BRAND_BY_MAKER_PREFIX.find(([prefix]) => maker.startsWith(prefix))?.[1];
}

function resolveName(brand: string, camera: LensfunCamera): string {
  const model = camera.model.replace(MAKER_PREFIX, '').replace(ASPECT_RATIO_SUFFIX, '');
  const english = (camera.englishModel ?? camera.model)
    .replace(MAKER_PREFIX, '')
    .replace(ASPECT_RATIO_SUFFIX, '')
    .replace(/ Digital Camera$/, '')
    .replace(/ ZOOM$/, ' Zoom')
    .split(',')[0];

  const name = brandName(brand, model, english).trim();
  return cleanModelName(NAME_OVERRIDES[`${brand}/${name}`] ?? name);
}

function brandName(brand: string, model: string, english: string): string {
  switch (brand) {
    case 'sony':
      return english.replace(/^Alpha /, 'A').replace(/^DSC-/, 'Cyber-shot DSC-');
    case 'nikon':
      return english.replace(/^Z (?=\w)/, 'Z').replace(/^(Z\d+)(I+)$/, '$1 $2');
    case 'panasonic': {
      const lumix = model
        .replace(/^(DMC|DC)-/, '')
        .replace(/^FZ10002$/, 'FZ1000 II')
        .replace(/M2X$/, ' IIX')
        .replace(/M2ES$/, ' IIE')
        .replace(/M2$/, ' II');
      return `Lumix ${lumix}`;
    }
    case 'olympus': {
      if (!/^(E-|PEN)/.test(model)) return english;
      const spaced = model.replace(/\s*Mark\s*/, ' Mark ');
      if (spaced.startsWith('E-M')) return `OM-D ${spaced}`;
      if (spaced.startsWith('E-P')) return `PEN ${spaced}`;
      return spaced;
    }
    case 'om-system':
      return model.replace(/\s*Mark\s*/, ' Mark ');
    default:
      return english;
  }
}

const lensfunDatabaseDirectory = process.argv[2];

if (!lensfunDatabaseDirectory) {
  throw new Error('Usage: pnpm db:import:lensfun <path to lensfun/data/db>');
}

const skipped = { unsupportedFile: 0, brand: 0, mount: 0, name: 0, duplicate: 0 };
const camerasByKey = new Map<string, ImportedCamera>();
const cropFactorByKey = new Map<string, number>();

for (const file of readdirSync(lensfunDatabaseDirectory).sort()) {
  if (!file.endsWith('.xml')) continue;

  const fileBodyType = BODY_TYPE_BY_FILE_PREFIX.find(([prefix]) => file.startsWith(prefix))?.[1];
  const cameras = parseCameras(
    file,
    readFileSync(path.join(lensfunDatabaseDirectory, file), 'utf8'),
  );

  for (const camera of cameras) {
    if (!fileBodyType) {
      skipped.unsupportedFile++;
      continue;
    }

    const brand = resolveBrand(camera);
    if (!brand) {
      skipped.brand++;
      continue;
    }

    const sensorFormat =
      SENSOR_FORMAT_BY_MAX_CROP_FACTOR.find(
        ([maxCropFactor]) => camera.cropFactor <= maxCropFactor,
      )?.[1] ?? null;

    const mount = fileBodyType === 'compact' ? undefined : MOUNT_BY_LENSFUN_MOUNT[camera.mount];
    if (fileBodyType !== 'compact' && !mount) {
      skipped.mount++;
      continue;
    }

    const name = resolveName(brand, camera);
    if (SKIPPED_LENSFUN_MODELS.has(camera.model) || SKIPPED_NAMES.some((p) => p.test(name))) {
      skipped.name++;
      continue;
    }

    const key = `${brand}/${name}`;
    const knownCropFactor = cropFactorByKey.get(key);
    if (knownCropFactor !== undefined) skipped.duplicate++;
    if (knownCropFactor !== undefined && knownCropFactor <= camera.cropFactor) continue;

    cropFactorByKey.set(key, camera.cropFactor);
    camerasByKey.set(key, {
      brand,
      name,
      mount: MOUNT_OVERRIDES[key] ?? mount,
      bodyType: BODY_TYPE_OVERRIDES[key] ?? fileBodyType,
      sensorFormat,
      searchTerms: MODEL_CODE.test(camera.model) ? [camera.model] : undefined,
    });
  }
}

const imported = [...camerasByKey.values()].sort(
  (a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name, 'en', { numeric: true }),
);

writeSeedData('lensfun-cameras.json', imported);

console.log(`Imported ${imported.length} cameras.`);
console.log('Skipped:', skipped);

type LensfunLens = {
  maker: string;
  model: string;
  englishModel?: string;
  mounts: string[];
};

const LENS_BRAND_BY_MAKER_PREFIX: [string, string][] = [
  ['canon', 'canon'],
  ['fujifilm', 'fujifilm'],
  ['leica', 'leica'],
  ['minolta', 'minolta'],
  ['nikon', 'nikon'],
  ['olympus', 'olympus'],
  ['panasonic', 'panasonic'],
  ['pentax', 'pentax'],
  ['ricoh imaging', 'pentax'],
  ['samsung', 'samsung'],
  ['samyang', 'samyang'],
  ['sigma', 'sigma'],
  ['sony', 'sony'],
  ['tamron', 'tamron'],
  ['tokina', 'tokina'],
  ['zeiss', 'zeiss'],
];

const LENS_MOUNT_BY_LENSFUN_MOUNT: Record<string, string> = {
  ...MOUNT_BY_LENSFUN_MOUNT,
  'Canon FD': 'canon-fd',
  'Contax/Yashica': 'contax-yashica',
  M42: 'm42',
  'Minolta MC': 'minolta-md',
  'Minolta MD': 'minolta-md',
  'Nikon F': 'nikon-f',
  'Nikon F AI': 'nikon-f',
  'Nikon F AI-S': 'nikon-f',
  'Pentax K': 'pentax-k',
  'Pentax KA': 'pentax-k',
  'Pentax KAF': 'pentax-k',
  'Pentax KAF3': 'pentax-k',
};

const LENS_MAKER_PREFIX: Record<string, RegExp> = {
  canon: /^canon\s+/i,
  minolta: /^minolta(\/sony)?\s+/i,
  nikon: /^nikon\s+/i,
  olympus: /^olympus\s+/i,
  samsung: /^samsung\s+/i,
  samyang: /^samyang\s+/i,
  sigma: /^sigma\s+/i,
  sony: /^(minolta\/sony|sony)\s+/i,
  tamron: /^(tamron\s+)?(E\s+)?/i,
  tokina: /^tokina\s+/i,
  zeiss: /^(carl zeiss|zeiss)\s+/i,
};

const LENS_NAME_OVERRIDES: Record<string, string> = {
  'sigma/30mm f/1.4 DC DN': '30mm f/1.4 DC DN Contemporary',
};

const SKIPPED_LENS_NAMES = [/converter/i, /\+/, /compatibles/, /body cap/i, /cine/i, /\bSN \d/];

const FOCAL_AND_APERTURE = /(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?mm\b.*?f\/(\d+(?:\.\d+)?)/;

function parseLenses(xml: string): LensfunLens[] {
  const withoutComments = xml.replace(/<!--[\s\S]*?-->/g, '');
  const lenses: LensfunLens[] = [];

  for (const [, block] of withoutComments.matchAll(/<lens>([\s\S]*?)<\/lens>/g)) {
    const decode = (value: string) => value.replaceAll('&amp;', '&').trim();
    const maker = block.match(/<maker>([^<]*)<\/maker>/)?.[1];
    const model = block.match(/<model>([^<]*)<\/model>/)?.[1];
    const englishModel = block.match(/<model lang="en">([^<]*)<\/model>/)?.[1];
    if (!maker || !model) continue;

    lenses.push({
      maker: decode(maker),
      model: decode(model),
      englishModel: englishModel ? decode(englishModel) : undefined,
      mounts: [...block.matchAll(/<mount>([^<]*)<\/mount>/g)].map(([, mount]) => decode(mount)),
    });
  }

  return lenses;
}

function resolveLensName(brand: string, lens: LensfunLens): string {
  const common = (lens.englishModel ?? lens.model)
    .replace(LENS_MAKER_PREFIX[brand] ?? /^$/, '')
    .replace(/\s*\((SAL|SEL|Vers\.|Model |\d+\/\d+)[^)]*\)/, '')
    .replace(brand === 'tamron' ? /\s*\(?\b[ABCF]\d{3}[A-Z]?\b.*$/ : /^$/, '')
    .replace(/1:([\d.]+(?:-[\d.]+)?)\/(\d+(?:-\d+)?)\b/, '$2mm f/$1')
    .replace(/mm 1:(?=\d)/, 'mm f/')
    .replace(/(\d) mm\b/, '$1mm')
    .replace(/mmF(?=\d)/, 'mm f/')
    .replace(/^RF-S(?=\d)/, 'RF-S ')
    .replace(/(\d) L (?=VCM|USM|IS)/, '$1L ')
    .replace(/\b[Ff]\/?(?=\d)/g, 'f/');

  const name = brandLensName(brand, common).replace(/\s+/g, ' ').trim();
  return cleanModelName(LENS_NAME_OVERRIDES[`${brand}/${name}`] ?? name);
}

function brandLensName(brand: string, name: string): string {
  switch (brand) {
    case 'fujifilm':
      return name.replace(/^(XF|XC|GF)(?=\d)/, '$1 ');
    case 'nikon':
      return name
        .replace(/^Nikkor (AF-S|AF-P|AF|AI-S|AI)\b/, '$1 NIKKOR')
        .replace(/^Nikkor Z\b/, 'NIKKOR Z')
        .replace(/^1 Nikkor\b/, '1 NIKKOR');
    case 'sigma':
      return name
        .replace(/\s*\|\s*(Contemporary|C)\b(\s+\d{3})?/, ' Contemporary')
        .replace(/\s*\|\s*(Art|A)\b(\s+\d{3})?/, ' Art')
        .replace(/\s*\|\s*(Sports?|S)\b(\s+\d{3})?/, ' Sport');
    case 'tamron':
      return name.replace(/Di ?III/, 'Di III').replace(/Di-II/, 'Di II');
    case 'zeiss':
      return name.replace(/ (\d(?:\.\d)?)\/(\d{2,3})\b/, ' $2mm f/$1');
    default:
      return name;
  }
}

const skippedLenses = { brand: 0, mount: 0, name: 0, unparsed: 0 };
const lensesByKey = new Map<string, ImportedLens>();

for (const file of readdirSync(lensfunDatabaseDirectory).sort()) {
  if (!file.endsWith('.xml') || !/^(mil|slr|rf|om-system)/.test(file)) continue;

  for (const lens of parseLenses(readFileSync(path.join(lensfunDatabaseDirectory, file), 'utf8'))) {
    const maker = lens.maker.toLowerCase();
    const brand = LENS_BRAND_BY_MAKER_PREFIX.find(([prefix]) => maker.startsWith(prefix))?.[1];
    if (!brand) {
      skippedLenses.brand++;
      continue;
    }

    const mounts = new Set(
      lens.mounts.map((mount) => LENS_MOUNT_BY_LENSFUN_MOUNT[mount]).filter(Boolean),
    );
    if (mounts.size === 0) {
      skippedLenses.mount++;
      continue;
    }

    const name = resolveLensName(brand, lens);
    if (SKIPPED_LENS_NAMES.some((pattern) => pattern.test(name))) {
      skippedLenses.name++;
      continue;
    }

    const [, focalMin, focalMax, aperture] = name.match(FOCAL_AND_APERTURE) ?? [];
    const focal: [number, number] = [Number(focalMin), Number(focalMax ?? focalMin)];
    const maxAperture = Number(aperture);
    if (!focalMin || focal[1] < focal[0] || maxAperture < 0.7 || maxAperture > 32) {
      skippedLenses.unparsed++;
      continue;
    }

    for (const mount of mounts) {
      const imported: ImportedLens = {
        brand,
        name,
        mount,
        focal,
        maxAperture,
        stabilized: STABILIZATION_MARKER.test(name),
      };
      if (!lensesByKey.has(lensKey(imported))) lensesByKey.set(lensKey(imported), imported);
    }
  }
}

const importedLenses = sortLenses(lensesByKey.values());
writeSeedData('lensfun-lenses.json', importedLenses);

console.log(`Imported ${importedLenses.length} lenses.`);
console.log('Skipped:', skippedLenses);
