import 'server-only';

import type {
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
} from '@/db/types';

export interface ListingSummary {
  id: string;
  title: string;
  priceCents: number;
  location: string;
  status: ListingStatus;
  isBundle: boolean;
  itemCount: number;
  brand: string | null;
  mount: string | null;
  cosmeticCondition: string | null;
  shutterCount: number | null;
  coverUrl: string | null;
}

export interface ListingItemDetail {
  id: string;
  modelName: string;
  modelSlug: string;
  brand: string;
  mount: string | null;
  category: ModelCategory;
  priceCents: number;
  cosmeticCondition: string;
  functionalCondition: string;
  shutterCount: number | null;
  soldSeparately: boolean;
  inclusions: string[];
}

export interface ListingPhotoUrl {
  largeUrl: string;
  cardUrl: string;
}

export interface ListingDetail {
  id: string;
  title: string;
  priceCents: number;
  location: string;
  status: ListingStatus;
  isBundle: boolean;
  description: string | null;
  contact: { email: string | null; phone: string | null };
  seller: { name: string; isStore: boolean; storeName: string | null; storeSlug: string | null };
  items: ListingItemDetail[];
  photos: ListingPhotoUrl[];
}

export interface CreateListingItemInput {
  modelId: string;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string | null;
  soldSeparately: boolean;
  inclusions: Inclusion[];
}

export interface CreateListingInput {
  sellerId: string;
  items: CreateListingItemInput[];
  bundlePrice: string | null;
  photoKeys: string[];
  location: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  publish: boolean;
}

export type CreateListingPayload = Omit<CreateListingInput, 'sellerId'>;
