import type { CosmeticCondition, FunctionalCondition, Inclusion, ModelCategory } from '@/db/tables';

export const COSMETIC_CONDITIONS: CosmeticCondition[] = [
  'new',
  'excellent',
  'good',
  'well_used',
  'damaged',
];

export const FUNCTIONAL_CONDITIONS: FunctionalCondition[] = [
  'fully_working',
  'minor_issues',
  'faulty',
];

export const CONDITION_TONES: Record<CosmeticCondition | FunctionalCondition, string> = {
  new: 'var(--success)',
  excellent: 'color-mix(in oklch, var(--success), var(--warning))',
  good: 'var(--warning)',
  well_used: 'color-mix(in oklch, var(--warning), var(--destructive))',
  damaged: 'var(--destructive)',
  fully_working: 'var(--success)',
  minor_issues: 'var(--warning)',
  faulty: 'var(--destructive)',
};

const INCLUSIONS: Inclusion[] = [
  'original_box',
  'charger',
  'oem_battery',
  'third_party_battery',
  'body_cap',
  'rear_cap',
  'lens_hood',
  'strap',
  'memory_card',
  'case',
  'manual',
  'receipt',
];

const CATEGORY_INCLUSIONS: Record<ModelCategory, Inclusion[]> = {
  camera: [
    'original_box',
    'charger',
    'oem_battery',
    'third_party_battery',
    'body_cap',
    'strap',
    'memory_card',
    'case',
    'manual',
    'receipt',
  ],
  lens: ['original_box', 'rear_cap', 'lens_hood', 'case', 'manual', 'receipt'],
  accessory: ['original_box', 'case', 'manual', 'receipt'],
};

const FILM_INCLUSIONS_OMITTED: Inclusion[] = ['charger', 'memory_card'];
const FIXED_LENS_INCLUSIONS_OMITTED: Inclusion[] = ['body_cap'];

export function inclusionsFor(gear: {
  category: ModelCategory;
  isFilm: boolean;
  hasMount: boolean;
}): Inclusion[] {
  const omitted = new Set<Inclusion>([
    ...(gear.isFilm ? FILM_INCLUSIONS_OMITTED : []),
    ...(gear.hasMount ? [] : FIXED_LENS_INCLUSIONS_OMITTED),
  ]);

  return INCLUSIONS.filter(
    (inclusion) =>
      CATEGORY_INCLUSIONS[gear.category].includes(inclusion) && !omitted.has(inclusion),
  );
}
