import 'server-only';

import type {
  CosmeticCondition,
  FunctionalCondition,
  Inclusion,
  ListingStatus,
  ModelCategory,
} from '@/db/types';
import type { CatalogModel } from '../model-catalog/model-catalog.types';

export interface ListingSummary {
  id: string;
  title: string;
  priceCents: number | null;
  city: string | null;
  status: ListingStatus;
  isBundle: boolean;
  itemCount: number;
  firstItemId: string | null;
  brand: string | null;
  mount: string | null;
  cosmeticCondition: string | null;
  shutterCount: number | null;
  coverUrl: string | null;
  isOwner: boolean;
}

export interface ListingPage {
  listings: ListingSummary[];
  hasMore: boolean;
}

export interface ListingItemDetail {
  id: string;
  modelName: string;
  brand: string | null;
  brandSlug: string | null;
  mount: string | null;
  category: ModelCategory;
  priceCents: number | null;
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
  priceCents: number | null;
  city: string | null;
  status: ListingStatus;
  isBundle: boolean;
  description: string | null;
  contact: { email: string | null; phone: string | null };
  seller: {
    id: string;
    name: string;
    isStore: boolean;
    storeName: string | null;
    storeSlug: string | null;
  };
  items: ListingItemDetail[];
  photos: ListingPhotoUrl[];
  isOwner: boolean;
}

export interface CustomItem {
  name: string;
  category: ModelCategory | null;
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
  inclusions: Inclusion[];
}

export interface EditableListing {
  id: string;
  status: ListingStatus;
  bundlePrice: string;
  cityId: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  photos: { storageKey: string; url: string }[];
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
  inclusions: Inclusion[];
}

export interface CreateListingInput {
  sellerId: string;
  items: CreateListingItemInput[];
  bundlePrice: string | null;
  photoKeys: string[];
  cityId: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  publish: boolean;
}

export interface CreatedListing {
  id: string;
  itemIds: string[];
}

export type CreateListingPayload = Omit<CreateListingInput, 'sellerId'>;
