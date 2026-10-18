import type { CameraBodyType, SensorFormat } from '../../src/db/types';

export type BrandSeed = { slug: string; name: string; searchTerms?: string[] };
export type MountSeed = { slug: string; name: string; brand?: string; searchTerms?: string[] };

export type CameraSeed = {
  brand: string;
  name: string;
  mount?: string;
  releaseYear?: number;
  bodyType: CameraBodyType;
  sensorFormat: SensorFormat | null;
  megapixels?: number;
  hasMechanicalShutter?: boolean;
  isFilm?: boolean;
  searchTerms?: string[];
};

export type LensSeed = {
  brand: string;
  name: string;
  mount: string;
  releaseYear?: number;
  focal: [number, number];
  maxAperture: number;
  stabilized?: boolean;
  filterThreadMm?: number;
  weightGrams?: number;
  brandName?: string;
};

export type AccessorySeed = {
  brand: string;
  name: string;
  releaseYear?: number;
};
