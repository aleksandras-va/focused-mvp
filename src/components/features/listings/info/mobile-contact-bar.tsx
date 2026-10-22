import { useTranslations } from 'next-intl';
import {
  MessageSellerDialog,
  type MessageSellerProps,
} from '@/components/features/listings/info/message-seller-dialog';
import { formatOptionalPrice } from '@/lib/format';
import { itemsForSale } from '@/lib/listing-photos';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface MobileContactBarProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
  messaging: MessageSellerProps | null;
}

export function MobileContactBar({ listing, focusedItem, messaging }: MobileContactBarProps) {
  const t = useTranslations('listing');
  const tEnums = useTranslations('enums');

  if (!messaging) return null;

  const forSale = itemsForSale(listing);
  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? (isBundleOverview ? null : (forSale[0] ?? null));
  const isBundleOnly = focusedItem !== null && listing.isBundle && !focusedItem.soldSeparately;
  const priceCents = item && !isBundleOnly ? item.priceCents : listing.priceCents;
  const caption = item
    ? `${item.modelName} · ${tEnums(`cosmeticCondition.${item.cosmeticCondition}`)}`
    : t('bundleBadge', { count: forSale.length });

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center justify-between gap-3 bg-background/95 px-4 py-3 shadow-[0_-1px_0_var(--color-border),0_-8px_24px_-12px_rgb(0_0_0/0.2)] backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
      <span className="flex min-w-0 flex-col">
        <span className="font-heading text-lg font-semibold">
          {formatOptionalPrice(priceCents, t('noPrice'))}
        </span>
        <span className="truncate text-xs text-muted-foreground">{caption}</span>
      </span>
      <MessageSellerDialog className="shrink-0" {...messaging} />
    </div>
  );
}
