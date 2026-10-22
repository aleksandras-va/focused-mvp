import { useTranslations } from 'next-intl';
import { BundleItemCard } from '@/components/features/listings/info/bundle-item-card';
import { IncludedList } from '@/components/features/listings/info/included-list';
import { itemsForSale, soldItems } from '@/lib/listing-photos';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingBodyProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
}

export function ListingBody({ listing, focusedItem }: ListingBodyProps) {
  const t = useTranslations('listing');
  const forSale = itemsForSale(listing);
  const sold = soldItems(listing);
  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? forSale[0] ?? null;

  return (
    <div className="flex flex-col gap-10">
      {isBundleOverview ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-[1.375rem] font-semibold">{t('inThisBundle')}</h2>
            <span className="text-sm text-muted-foreground">
              {t('itemCount', { count: forSale.length })}
            </span>
          </div>
          {forSale.map((bundleItem) => (
            <BundleItemCard key={bundleItem.id} item={bundleItem} />
          ))}
          {sold.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('alreadySold', { names: sold.map((soldItem) => soldItem.modelName).join(', ') })}
            </p>
          ) : null}
        </section>
      ) : null}

      {!isBundleOverview && item?.description ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-[1.375rem] font-semibold">{t('fromSeller')}</h2>
          <p className="max-w-2xl text-base leading-relaxed whitespace-pre-line text-foreground/85">
            {item.description}
          </p>
        </section>
      ) : null}

      {!isBundleOverview && item ? <IncludedList item={item} /> : null}
    </div>
  );
}
