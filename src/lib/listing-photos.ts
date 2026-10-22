import type {
  ListingDetail,
  ListingItemDetail,
  ListingPhotoUrl,
} from '@/services/listing/listing.types';

export function itemsForSale(listing: ListingDetail): ListingItemDetail[] {
  return listing.items.filter((item) => !item.isSold);
}

export function soldItems(listing: ListingDetail): ListingItemDetail[] {
  return listing.items.filter((item) => item.isSold);
}

export function galleryPhotos(
  listing: ListingDetail,
  focusedItem: ListingItemDetail | null,
): ListingPhotoUrl[] {
  if (focusedItem) return focusedItem.photos;

  return itemsForSale(listing).flatMap((item) => item.photos);
}
