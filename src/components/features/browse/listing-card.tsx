import { ImageIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { formatCount, formatOptionalPrice } from '@/lib/format';
import { LISTING_STATUS_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';
import type { ListingSummary } from '@/services/listing/listing.types';

export type ListingCardItem = {
  href: string;
  title: string;
  subtitle: string;
  detail: string;
  priceCents: number | null;
  condition: string;
  imageUrl: string | null;
  isBundle: boolean;
  statusLabel: string | null;
  editHref: string | null;
};

export function toListingCardItem(listing: ListingSummary): ListingCardItem {
  const detail =
    listing.shutterCount !== null
      ? `${formatCount(listing.shutterCount)} shutter actuations`
      : (listing.mount ?? listing.city ?? '');

  return {
    href:
      listing.isBundle || !listing.firstItemId
        ? `/bundles/${listing.id}`
        : `/items/${listing.firstItemId}`,
    title: listing.title,
    subtitle: listing.isBundle ? `${listing.itemCount} items` : (listing.brand ?? ''),
    detail,
    priceCents: listing.priceCents,
    condition: listing.cosmeticCondition ?? '',
    imageUrl: listing.coverUrl,
    isBundle: listing.isBundle,
    statusLabel: listing.status === 'active' ? null : LISTING_STATUS_LABELS[listing.status],
    editHref: listing.isOwner ? `/sell/${listing.id}` : null,
  };
}

const overlayBadgeClass =
  'rounded-full px-2.5 py-1 text-xs font-medium shadow-[0_1px_2px_rgb(0_0_0/0.15)]';

export function ListingCard({ item }: { item: ListingCardItem }) {
  const { href } = item;

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      {item.editHref ? (
        <Link
          href={item.editHref}
          aria-label="Edit this ad"
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

        {item.isBundle || item.statusLabel ? (
          <div className="absolute top-2 left-2 flex gap-1.5">
            {item.isBundle ? (
              <span className={cn(overlayBadgeClass, 'bg-white/90 text-foreground')}>Bundle</span>
            ) : null}
            {item.statusLabel ? (
              <span className={cn(overlayBadgeClass, 'bg-foreground text-background')}>
                {item.statusLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="truncate text-xs text-muted-foreground">{item.subtitle || ' '}</p>
        <h3 className="line-clamp-2 font-medium leading-snug">
          <Link href={href} className="after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        {item.detail ? <p className="text-xs text-muted-foreground">{item.detail}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-muted/60 px-4 py-3">
        <span className="text-lg font-semibold">{formatOptionalPrice(item.priceCents)}</span>
        {item.condition ? (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
            {item.condition}
          </span>
        ) : null}
      </div>
    </article>
  );
}
