import { ImageIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import type { CosmeticCondition, ListingStatus } from '@/db/tables';
import { formatPrice } from '@/lib/format';
import { formatListingTitle, type ListingTitle } from '@/lib/listing-title';
import { cn } from '@/lib/utils';
import type { ListingSummary } from '@/services/listing/listing.types';

export type ListingCardItem = {
  href: string;
  title: ListingTitle;
  brand: string | null;
  itemCount: number;
  place: string | null;
  shutterCount: number | null;
  priceCents: number | null;
  condition: CosmeticCondition | null;
  imageUrl: string | null;
  isBundle: boolean;
  status: ListingStatus;
  editHref: string | null;
};

export function toListingCardItem(listing: ListingSummary): ListingCardItem {
  return {
    href:
      listing.isBundle || !listing.firstItemId
        ? `/bundles/${listing.id}`
        : `/items/${listing.firstItemId}`,
    title: listing.title,
    brand: listing.brand,
    itemCount: listing.itemCount,
    place: listing.mount ?? listing.city,
    shutterCount: listing.shutterCount,
    priceCents: listing.priceCents,
    condition: listing.cosmeticCondition,
    imageUrl: listing.coverUrl,
    isBundle: listing.isBundle,
    status: listing.status,
    editHref: listing.isOwner ? `/sell/${listing.id}` : null,
  };
}

const overlayBadgeClass =
  'rounded-full px-2.5 py-1 text-xs font-medium shadow-[0_1px_2px_rgb(0_0_0/0.15)]';

export function ListingCard({ item }: { item: ListingCardItem }) {
  const t = useTranslations('listingCard');
  const tEnums = useTranslations('enums');
  const tTitle = useTranslations('listingTitle');
  const { href } = item;
  const subtitle = item.isBundle ? t('itemCount', { count: item.itemCount }) : item.brand;
  const detail =
    item.shutterCount !== null ? t('shutterCount', { count: item.shutterCount }) : item.place;
  const statusLabel = item.status === 'active' ? null : tEnums(`listingStatus.${item.status}`);

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {item.editHref ? (
        <Link
          href={item.editHref}
          aria-label={t('edit')}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'icon-sm' }),
            'absolute top-2 right-2 z-10 shadow-sm',
          )}
        >
          <PencilIcon className="size-4" />
        </Link>
      ) : null}

      <Link
        href={href}
        className="relative block aspect-4/3 overflow-hidden bg-muted"
        tabIndex={-1}
        aria-hidden
      >
        {item.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer
          <img
            src={item.imageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground/50" />
          </div>
        )}

        {item.isBundle || statusLabel ? (
          <div className="absolute top-2 left-2 flex gap-1.5">
            {item.isBundle ? (
              <span className={cn(overlayBadgeClass, 'bg-white/90 text-foreground')}>
                {t('bundle')}
              </span>
            ) : null}
            {statusLabel ? (
              <span className={cn(overlayBadgeClass, 'bg-foreground text-background')}>
                {statusLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="truncate text-xs text-muted-foreground">{subtitle || ' '}</p>
        <h3 className="line-clamp-2 font-medium leading-snug">
          <Link href={href} className="after:absolute after:inset-0">
            {formatListingTitle(item.title, tTitle)}
          </Link>
        </h3>
        {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/60 px-4 py-3">
        <span className="font-heading text-lg font-semibold">
          {item.priceCents === null ? t('noPrice') : formatPrice(item.priceCents)}
        </span>
        {item.condition ? (
          <span className="rounded-full border border-input bg-background px-2.5 py-0.5 text-xs font-medium">
            {tEnums(`cosmeticCondition.${item.condition}`)}
          </span>
        ) : null}
      </div>
    </article>
  );
}
