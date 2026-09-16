import 'server-only';

import type { CameraBodyType, ModelCategory, SensorFormat } from '@/db/types';

interface CameraDetails {
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat;
  megapixels: number | null;
  hasMechanicalShutter: boolean;
}

interface LensDetails {
  focalMinMm: number;
  focalMaxMm: number;
  isZoom: boolean;
  maxAperture: number;
  hasStabilization: boolean;
  filterThreadMm: number | null;
}

export type CatalogModelDetail = CatalogModel & {
  camera: CameraDetails | null;
  lens: LensDetails | null;
};

interface CatalogBrand {
  slug: string;
  name: string;
}

export interface BrandAndModelSearchResults {
  brands: CatalogBrand[];
  models: CatalogModel[];
}

export interface CatalogModel {
  id: string;
  slug: string;
  category: ModelCategory;
  name: string;
  displayName: string;
  brand: { slug: string; name: string };
  mount: { slug: string; name: string } | null;
  releaseYear: number | null;
  isFilm: boolean;
}
