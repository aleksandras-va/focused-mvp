import 'server-only';

import type { ModelCategory } from '@/db/types';

import { brandRepository } from '@/repositories/brand.repository';
import { modelRepository } from '@/repositories/model.repository';
import { mountRepository } from '@/repositories/mount.repository';

import { mapToCatalogModel, mapToCatalogModelDetail } from './model-catalog.mappers';
import type {
  BrandAndModelSearchResults,
  CatalogModel,
  CatalogModelDetail,
} from './model-catalog.types';

export const modelCatalogService = {
  async getModel(slug: string): Promise<CatalogModelDetail | null> {
    const row = await modelRepository.findBySlug(slug);

    return row ? mapToCatalogModelDetail(row) : null;
  },

  async getSuggested(): Promise<CatalogModel[]> {
    const rows = await modelRepository.listSuggested();

    return rows.map(mapToCatalogModel);
  },

  async getFilters(category?: ModelCategory) {
    const [brands, mounts] = await Promise.all([
      brandRepository.list(category),
      mountRepository.list(),
    ]);

    return {
      brands: brands.map((b) => ({ slug: b.slug, name: b.name })),
      mounts: mounts.map((m) => ({
        slug: m.slug,
        name: m.name,
        brand: m.brand_name,
      })),
    };
  },

  // Whats the diff between these?
  async search(
    term: string,
    options: { category?: ModelCategory; limit?: number } = {},
  ): Promise<CatalogModel[]> {
    const trimmed = term.trim();

    if (!trimmed) return [];

    const rows = await modelRepository.search(trimmed, options);

    return rows.map(mapToCatalogModel);
  },

  async searchBrandAndModel(term: string): Promise<BrandAndModelSearchResults> {
    const trimmed = term.trim();

    if (trimmed.length < 1) return { brands: [], models: [] };

    const [brands, models] = await Promise.all([
      brandRepository.search(trimmed),
      modelRepository.search(trimmed, { limit: 8 }),
    ]);

    return {
      brands: brands.map((brand) => ({ slug: brand.slug, name: brand.name })),
      models: models.map(mapToCatalogModel),
    };
  },
} as const;
