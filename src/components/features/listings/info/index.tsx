import { useTranslations } from 'next-intl';
import { ListingBreadcrumbs } from '@/components/features/listings/info/breadcrumbs';
import { BundleNotice } from '@/components/features/listings/info/bundle-notice';
import { BundlePriceList } from '@/components/features/listings/info/bundle-price-list';
import { ContactActions } from '@/components/features/listings/info/contact-actions';
import { FactTiles } from '@/components/features/listings/info/fact-tiles';
import type { MessageSellerProps } from '@/components/features/listings/info/message-seller-dialog';
import { SafetyNote } from '@/components/features/listings/info/safety-note';
import { SellerCard } from '@/components/features/listings/info/seller-card';
import { Badge } from '@/components/ui/badge';
import { formatOptionalPrice } from '@/lib/format';
import type { ListingDetail, ListingItemDetail } from '@/services/listing/listing.types';

interface ListingInfoProps {
  listing: ListingDetail;
  focusedItem: ListingItemDetail | null;
  isSignedIn: boolean;
  messaging: MessageSellerProps | null;
}

export function ListingInfo({ listing, focusedItem, isSignedIn, messaging }: ListingInfoProps) {
  const t = useTranslations('listing');
  const tEnums = useTranslations('enums');
  const isBundleOverview = listing.isBundle && !focusedItem;
  const item = focusedItem ?? (isBundleOverview ? null : (listing.items[0] ?? null));
  const title = item?.modelName ?? listing.title;
  const priceCents = item?.priceCents ?? listing.priceCents;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {!isBundleOverview && <ListingBreadcrumbs item={item} />}
        {isBundleOverview ? (
          <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-ink">
            {t('bundleBadge', { count: listing.items.length })}
          </span>
        ) : null}
        <h1
          className={
            isBundleOverview
              ? 'font-heading text-3xl leading-tight font-semibold text-balance'
              : 'font-heading text-3xl leading-tight font-semibold text-balance sm:text-4xl'
          }
        >
          {title}
        </h1>
        {item ? (
          <p className="text-muted-foreground">
            {[tEnums(`category.${item.category}`), item.mount].filter(Boolean).join(' · ')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="font-heading text-3xl font-semibold tracking-tight">
          {formatOptionalPrice(priceCents, t('noPrice'))}
        </p>
        {isBundleOverview ? (
          <p className="text-sm text-muted-foreground">
            {t('forAll', { count: listing.items.length })}
          </p>
        ) : null}
        {listing.status !== 'active' ? (
          <Badge variant="outline" className="mt-2 w-fit">
            {tEnums(`listingStatus.${listing.status}`)}
          </Badge>
        ) : null}
      </div>

      {item ? <FactTiles item={item} /> : <BundlePriceList items={listing.items} />}

      {focusedItem && listing.isBundle ? (
        <BundleNotice
          bundleId={listing.id}
          bundleTitle={listing.title}
          soldSeparately={focusedItem.soldSeparately}
        />
      ) : null}

      <ContactActions phone={listing.contact.phone} isSignedIn={isSignedIn} messaging={messaging} />
      <SellerCard seller={listing.seller} city={listing.city} />
      <SafetyNote />
    </div>
  );
}
