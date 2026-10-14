import {
  MessageSellerDialog,
  type MessageSellerProps,
} from '@/components/features/listings/info/message-seller-dialog';
import { formatOptionalPrice } from '@/lib/format';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface MobileContactBarProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
  messaging: MessageSellerProps | null;
}

export function MobileContactBar({ listing, focusedItem, messaging }: MobileContactBarProps) {
  if (!messaging) return null;

  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? (isBundleOverview ? null : (listing.items[0] ?? null));
  const priceCents = item?.priceCents ?? listing.priceCents;
  const caption = item
    ? `${item.modelName} · ${item.cosmeticCondition}`
    : `Bundle · ${listing.items.length} items`;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 bg-background/95 px-4 py-3 shadow-[0_-1px_0_var(--color-border),0_-8px_24px_-12px_rgb(0_0_0/0.2)] backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
      <span className="flex min-w-0 flex-col">
        <span className="text-lg font-bold">{formatOptionalPrice(priceCents)}</span>
        <span className="truncate text-xs text-muted-foreground">{caption}</span>
      </span>
      <MessageSellerDialog className="shrink-0" {...messaging} />
    </div>
  );
}
