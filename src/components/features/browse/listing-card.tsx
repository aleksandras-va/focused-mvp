import { ImageIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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

export function ListingCard({ item }: { item: ListingCardItem }) {
  const { href } = item;

  return (
    <Card className="relative overflow-hidden pt-0 transition-shadow hover:shadow-md">
      {item.editHref ? (
        <Link
          href={item.editHref}
          aria-label="Edit this ad"
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'icon' }),
            'absolute top-2 right-2 z-10 size-8 shadow-sm',
          )}
        >
          <PencilIcon className="size-4" />
        </Link>
      ) : null}

      <Link href={href} className="block">
        {item.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-4/3 w-full bg-muted object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-4/3 items-center justify-center bg-muted">
            <ImageIcon className="size-8 text-muted-foreground/50" />
          </div>
        )}
      </Link>

      <CardContent className="flex-1 space-y-1">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.subtitle}
          {item.isBundle ? <Badge variant="outline">Bundle</Badge> : null}
          {item.statusLabel ? <Badge>{item.statusLabel}</Badge> : null}
        </p>
        <Link href={href} className="hover:underline">
          <h3 className="line-clamp-2 min-h-[2lh] font-medium leading-tight">{item.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </CardContent>

      <CardFooter className="justify-between">
        <span className="font-heading text-lg font-semibold">
          {formatOptionalPrice(item.priceCents)}
        </span>
        <Badge variant="secondary">{item.condition}</Badge>
      </CardFooter>
    </Card>
  );
}
