import 'server-only';

import type { ModelDetailRow, ModelRow, ModelWithAdsRow } from '@/repositories/model.repository';
import type { CatalogModel, CatalogModelDetail, CatalogModelWithAds } from './model-catalog.types';

export function mapToCatalogModel(row: ModelRow): CatalogModel {
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

export function mapToCatalogModelWithAds(row: ModelWithAdsRow): CatalogModelWithAds {
  return {
    ...mapToCatalogModel(row),
    adCount: row.ad_count ?? 0,
    minPriceCents: row.min_price_cents,
  };
}

export function mapToCatalogModelDetail(row: ModelDetailRow): CatalogModelDetail {
  return {
    ...mapToCatalogModel(row),
    camera: row.body_type
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
