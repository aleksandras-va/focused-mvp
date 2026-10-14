import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import type { ConversationListing } from '@/services/conversation/conversation.types';

interface ListingBannerProps {
  listing: ConversationListing | null;
}

export function ListingBanner({ listing }: ListingBannerProps) {
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
        <span className="truncate font-semibold">{listing?.title ?? 'Deleted ad'}</span>
        <span className="text-sm text-muted-foreground">
          {!listing
            ? 'The seller removed this ad.'
            : listing.isPublic
              ? 'About this ad'
              : 'This ad is no longer public.'}
        </span>
      </span>
      {listing?.isPublic ? (
        <Link
          href={`/bundles/${listing.id}`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'border-input' })}
        >
          View ad
        </Link>
      ) : null}
    </div>
  );
}
