import 'server-only';

import type {
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
} from '@/db/types';
import type { ListingTitle } from '@/lib/listing-title';
import type { CatalogModel } from '../model-catalog/model-catalog.types';

export type ListingErrorCode =
  | 'not_found'
  | 'not_owner'
  | 'not_active'
  | 'no_items'
  | 'no_city'
  | 'missing_price'
  | 'missing_bundle_price'
  | 'no_photos'
  | 'too_many_photos'
  | 'invalid_item'
  | 'photo_failed'
  | 'missing_model'
  | 'missing_custom_name'
  | 'missing_custom_category'
  | 'invalid_price'
  | 'invalid_shutter_count';

export type BundleRole = 'none' | 'alsoInBundle' | 'bundleOnly';

export interface ListingSummary {
  id: string;
  itemId: string | null;
  title: ListingTitle;
  priceCents: number | null;
  fullPriceCents: number | null;
  city: string | null;
  status: ListingStatus;
  isBundle: boolean;
  itemCount: number;
  bundleRole: BundleRole;
  bundledWith: { category: ModelCategory; count: number }[];
  brand: string | null;
  mount: string | null;
  cosmeticCondition: CosmeticCondition | null;
  shutterCount: number | null;
  coverUrl: string | null;
  isOwner: boolean;
}

export interface SitemapListing {
  id: string;
  sellerId: string;
  itemIds: string[];
  isBundle: boolean;
  updatedAt: Date;
}

export interface ListingPage {
  listings: ListingSummary[];
  hasMore: boolean;
}

export type SimilarListingsBasis = 'similarLenses' | 'sameMount' | 'sameBrand' | 'newest';

export interface SimilarListings {
  basis: SimilarListingsBasis;
  basisName: string | null;
  category: ModelCategory;
  listings: ListingSummary[];
}

export interface ListingPhotoUrl {
  largeUrl: string;
  cardUrl: string;
}

export interface ListingItemDetail {
  id: string;
  modelName: string;
  modelSlug: string | null;
  brand: string | null;
  brandSlug: string | null;
  mount: string | null;
  category: ModelCategory;
  priceCents: number | null;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: number | null;
  soldSeparately: boolean;
  isSold: boolean;
  description: string | null;
  photos: ListingPhotoUrl[];
  inclusions: Inclusion[];
}

export interface ListingDetail {
  id: string;
  title: ListingTitle;
  priceCents: number | null;
  fullPriceCents: number | null;
  city: string | null;
  status: ListingStatus;
  isBundle: boolean;
  contact: { email: string | null; phone: string | null };
  seller: {
    id: string;
    name: string;
    isStore: boolean;
    storeName: string | null;
    storeSlug: string | null;
  };
  items: ListingItemDetail[];
  isOwner: boolean;
}

export interface CustomItem {
  name: string;
  category: ModelCategory | null;
}

export interface EditablePhoto {
  storageKey: string;
  url: string;
}

export interface EditableListingItem {
  id: string;
  model: CatalogModel | null;
  custom: CustomItem | null;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string;
  soldSeparately: boolean;
  description: string;
  photos: EditablePhoto[];
  inclusions: Inclusion[];
}

export interface EditableListing {
  id: string;
  status: ListingStatus;
  bundlePrice: string;
  cityId: string;
  contactEmail: string;
  contactPhone: string;
  items: EditableListingItem[];
}

export interface CreateListingItemInput {
  id: string;
  modelId: string;
  custom: CustomItem | null;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string | null;
  soldSeparately: boolean;
  description: string | null;
  photoKeys: string[];
  inclusions: Inclusion[];
}

export interface CreateListingInput {
  sellerId: string;
  items: CreateListingItemInput[];
  bundlePrice: string | null;
  cityId: string;
  contactEmail: string | null;
  contactPhone: string | null;
  publish: boolean;
}

export interface CreatedListing {
  id: string;
  itemIds: string[];
  publishedNow: boolean;
}

export type CreateListingPayload = Omit<CreateListingInput, 'sellerId'>;
