import type { CosmeticCondition, ModelCategory } from '@/db/tables';

export const BROWSE_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
] as const;

export type BrowseSort = (typeof BROWSE_SORTS)[number]['value'];

export type BrowseFilters = {
  category: ModelCategory | null;
  brand: string | null;
  mount: string | null;
  model: string | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  cosmeticCondition: CosmeticCondition | null;
  sort: BrowseSort;
};

const CATEGORIES: ModelCategory[] = ['camera', 'lens', 'accessory'];
const CONDITIONS: CosmeticCondition[] = ['mint', 'excellent', 'good', 'well_used', 'damaged'];

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string | null {
  const value = params[key];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() ? first.trim() : null;
}

function euros(params: SearchParams, key: string): number | null {
  const value = Number(single(params, key));
  return Number.isFinite(value) && value >= 0 && single(params, key)
    ? Math.round(value * 100)
    : null;
}

export function parseBrowseFilters(params: SearchParams): BrowseFilters {
  const category = single(params, 'category');
  const condition = single(params, 'condition');
  const sort = single(params, 'sort');

  return {
    category: CATEGORIES.find((c) => c === category) ?? null,
    brand: single(params, 'brand'),
    mount: single(params, 'mount'),
    model: single(params, 'model'),
    minPriceCents: euros(params, 'min'),
    maxPriceCents: euros(params, 'max'),
    cosmeticCondition: CONDITIONS.find((c) => c === condition) ?? null,
    sort: BROWSE_SORTS.find((s) => s.value === sort)?.value ?? 'newest',
  };
}

export function browseHref(filters: BrowseFilters, overrides: Partial<BrowseFilters> = {}) {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.category) params.set('category', merged.category);
  if (merged.brand) params.set('brand', merged.brand);
  if (merged.mount) params.set('mount', merged.mount);
  if (merged.model) params.set('model', merged.model);
  if (merged.minPriceCents !== null) params.set('min', String(merged.minPriceCents / 100));
  if (merged.maxPriceCents !== null) params.set('max', String(merged.maxPriceCents / 100));
  if (merged.cosmeticCondition) params.set('condition', merged.cosmeticCondition);
  if (merged.sort !== 'newest') params.set('sort', merged.sort);

  const query = params.toString();

  return query ? `/items?${query}` : '/items';
}

export function hasActiveFilters(filters: BrowseFilters) {
  return (
    filters.category !== null ||
    filters.brand !== null ||
    filters.mount !== null ||
    filters.model !== null ||
    filters.minPriceCents !== null ||
    filters.maxPriceCents !== null ||
    filters.cosmeticCondition !== null
  );
}
