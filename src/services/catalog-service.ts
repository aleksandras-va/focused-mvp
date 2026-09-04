import 'server-only';
import type { CameraBodyType, ModelCategory, SensorFormat } from '@/db/types';
import { listBrandsInUse, searchBrands } from '@/repositories/brand-repository';
import {
  findModelBySlug,
  listSuggestedModels,
  type ModelDetailRow,
  type ModelRow,
  searchModels,
} from '@/repositories/model-repository';
import { listMounts } from '@/repositories/mount-repository';

/**
 * Catalog use cases. Repositories speak the database's snake_case; everything
 * above this layer gets these DTOs instead, so column renames stop here.
 */

export type CatalogModel = {
  id: string;
  slug: string;
  category: ModelCategory;
  /** Model name without the brand: "X-T3". */
  name: string;
  /** Full canonical name, for display: "Fujifilm X-T3". */
  displayName: string;
  brand: { slug: string; name: string };
  mount: { slug: string; name: string } | null;
  releaseYear: number | null;
  /** True only for film cameras; drives which questions the ad form asks. */
  isFilm: boolean;
};

export type CameraDetails = {
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat;
  megapixels: number | null;
  /** Whether asking the seller for a shutter count makes sense. */
  hasMechanicalShutter: boolean;
};

export type LensDetails = {
  focalMinMm: number;
  focalMaxMm: number;
  isZoom: boolean;
  maxAperture: number;
  hasStabilization: boolean;
  filterThreadMm: number | null;
};

export type CatalogModelDetail = CatalogModel & {
  camera: CameraDetails | null;
  lens: LensDetails | null;
};

function toCatalogModel(row: ModelRow): CatalogModel {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    displayName: row.display_name,
    brand: { slug: row.brand_slug, name: row.brand_name },
    mount: row.mount_slug && row.mount_name ? { slug: row.mount_slug, name: row.mount_name } : null,
    releaseYear: row.release_year,
    isFilm: row.is_film ?? false,
  };
}

function toCatalogModelDetail(row: ModelDetailRow): CatalogModelDetail {
  return {
    ...toCatalogModel(row),
    camera:
      row.body_type && row.sensor_format
        ? {
            bodyType: row.body_type,
            sensorFormat: row.sensor_format,
            megapixels: row.megapixels,
            hasMechanicalShutter: row.has_mechanical_shutter ?? true,
          }
        : null,
    lens:
      row.focal_min_mm !== null && row.focal_max_mm !== null && row.max_aperture !== null
        ? {
            focalMinMm: row.focal_min_mm,
            focalMaxMm: row.focal_max_mm,
            isZoom: row.focal_max_mm > row.focal_min_mm,
            maxAperture: row.max_aperture,
            hasStabilization: row.has_stabilization ?? false,
            filterThreadMm: row.filter_thread_mm,
          }
        : null,
  };
}

export type CatalogBrand = { slug: string; name: string };

export type SiteSearchResults = {
  brands: CatalogBrand[];
  models: CatalogModel[];
};

/** Header search: brands by prefix, models by prefix with similarity fallback. */
export async function searchSite(term: string): Promise<SiteSearchResults> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return { brands: [], models: [] };

  const [brands, models] = await Promise.all([
    searchBrands(trimmed),
    searchModels(trimmed, { limit: 8 }),
  ]);

  return {
    brands: brands.map((brand) => ({ slug: brand.slug, name: brand.name })),
    models: models.map(toCatalogModel),
  };
}

export async function getSuggestedModels(): Promise<CatalogModel[]> {
  const rows = await listSuggestedModels();
  return rows.map(toCatalogModel);
}

/** Resolves whatever a seller typed onto real catalog entries. */
export async function searchCatalog(
  term: string,
  options: { category?: ModelCategory; limit?: number } = {},
): Promise<CatalogModel[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const rows = await searchModels(trimmed, options);
  return rows.map(toCatalogModel);
}

export async function getCatalogModel(slug: string): Promise<CatalogModelDetail | null> {
  const row = await findModelBySlug(slug);
  return row ? toCatalogModelDetail(row) : null;
}

export async function getCatalogFilters(category?: ModelCategory) {
  const [brands, mounts] = await Promise.all([listBrandsInUse(category), listMounts()]);

  return {
    brands: brands.map((b) => ({ slug: b.slug, name: b.name })),
    mounts: mounts.map((m) => ({
      slug: m.slug,
      name: m.name,
      brand: m.brand_name,
    })),
  };
}
