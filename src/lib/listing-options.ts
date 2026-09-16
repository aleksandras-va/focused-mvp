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

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  removed: 'Removed',
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

export const LISTING_LABELS = new Map<string, string>(
  [...COSMETIC_CONDITIONS, ...FUNCTIONAL_CONDITIONS, ...INCLUSIONS].map((option) => [
    option.value as string,
    option.label,
  ]),
);
