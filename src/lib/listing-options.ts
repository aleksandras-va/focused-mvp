import type {
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
} from '@/db/tables';

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  camera: 'Camera',
  lens: 'Lens',
  accessory: 'Accessory',
};

export const CATEGORY_PLURAL_LABELS: Record<ModelCategory, string> = {
  camera: 'Cameras',
  lens: 'Lenses',
  accessory: 'Accessories',
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  removed: 'Removed',
};

export const COSMETIC_CONDITION_HINTS: Record<CosmeticCondition, string> = {
  mint: 'Looks new',
  excellent: 'Barely any marks',
  good: 'Light wear',
  well_used: 'Visible wear',
  damaged: 'Dents or cracks',
};

export const COSMETIC_CONDITIONS: { value: CosmeticCondition; label: string }[] = [
  { value: 'mint', label: 'Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'well_used', label: 'Well used' },
  { value: 'damaged', label: 'Damaged' },
];

export const FUNCTIONAL_CONDITIONS: { value: FunctionalCondition; label: string }[] = [
  { value: 'fully_working', label: 'Fully working' },
  { value: 'minor_issues', label: 'Minor issues' },
  { value: 'faulty', label: 'Faulty' },
];

export const INCLUSIONS: { value: Inclusion; label: string }[] = [
  { value: 'original_box', label: 'Original box' },
  { value: 'charger', label: 'Charger' },
  { value: 'oem_battery', label: 'OEM battery' },
  { value: 'third_party_battery', label: 'Third-party battery' },
  { value: 'body_cap', label: 'Body cap' },
  { value: 'rear_cap', label: 'Rear cap' },
  { value: 'lens_hood', label: 'Lens hood' },
  { value: 'strap', label: 'Strap' },
  { value: 'memory_card', label: 'Memory card' },
  { value: 'case', label: 'Case or bag' },
  { value: 'manual', label: 'Manual' },
  { value: 'receipt', label: 'Receipt' },
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
}): { value: Inclusion; label: string }[] {
  const omitted = new Set<Inclusion>([
    ...(gear.isFilm ? FILM_INCLUSIONS_OMITTED : []),
    ...(gear.hasMount ? [] : FIXED_LENS_INCLUSIONS_OMITTED),
  ]);

  return INCLUSIONS.filter(
    ({ value }) => CATEGORY_INCLUSIONS[gear.category].includes(value) && !omitted.has(value),
  );
}

export const LISTING_LABELS = new Map<string, string>(
  [...COSMETIC_CONDITIONS, ...FUNCTIONAL_CONDITIONS, ...INCLUSIONS].map((option) => [
    option.value as string,
    option.label,
  ]),
);
