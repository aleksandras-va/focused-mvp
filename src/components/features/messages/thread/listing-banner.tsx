import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { formatListingTitle } from '@/lib/listing-title';
import { cn } from '@/lib/utils';
import type { ConversationListing } from '@/services/conversation/conversation.types';

interface ListingBannerProps {
  listing: ConversationListing | null;
}

export function ListingBanner({ listing }: ListingBannerProps) {
  const t = useTranslations('messages');
  const tTitle = useTranslations('listingTitle');

  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-accent/50 p-3">
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
        {listing?.coverUrl ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
            <img
              src={listing.coverUrl}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
            />
          </>
        ) : (
          <ImageIcon className="size-5" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold">
          {listing ? formatListingTitle(listing.title, tTitle) : t('deletedAd')}
        </span>
        <span className="text-sm text-muted-foreground">
          {!listing ? t('adRemoved') : listing.isPublic ? t('aboutAd') : t('adNotPublic')}
        </span>
      </span>
      {listing?.isPublic ? (
        <Link
          href={`/bundles/${listing.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-input')}
        >
          {t('viewAd')}
        </Link>
      ) : null}
    </div>
  );
}
