'use client';

import { EyeOffIcon, PencilIcon, TagIcon, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { DeleteListingDialog } from '@/components/features/listings/delete-listing-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { ListingStatus } from '@/db/tables';
import { LISTING_STATUS_LABELS } from '@/lib/listing-options';

type OwnerAction = (listingId: string) => Promise<{ error: string | null }>;

const NOT_PUBLIC_NOTICES: Record<ListingStatus, string> = {
  draft: 'Not published yet — only you can see this page.',
  active: '',
  sold: 'Marked as sold, so buyers no longer see this page.',
  removed: 'Hidden, so buyers no longer see this page. Publish it to bring it back.',
};

interface OwnerBarProps {
  listingId: string;
  status: ListingStatus;
  editHref: string;
  markSoldAction: OwnerAction;
  hideAction: OwnerAction;
  restoreAction: OwnerAction;
  deleteAction: OwnerAction;
}

export function OwnerBar({
  listingId,
  status,
  editHref,
  markSoldAction,
  hideAction,
  restoreAction,
  deleteAction,
}: OwnerBarProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (action: OwnerAction) => {
    setError(null);

    startTransition(async () => {
      const result = await action(listingId);

      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-accent bg-accent/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Your ad</span>
            <Badge variant={status === 'active' ? 'outline' : 'default'} className="bg-background">
              {LISTING_STATUS_LABELS[status]}
            </Badge>
          </div>
          {status === 'active' ? null : (
            <p className="text-sm text-muted-foreground">{NOT_PUBLIC_NOTICES[status]}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={buttonVariants({ variant: 'outline' })}>
            <PencilIcon />
            {status === 'draft' ? 'Continue editing' : 'Edit'}
          </Link>

          {status === 'active' ? (
            <Button variant="outline" disabled={isPending} onClick={() => run(markSoldAction)}>
              <TagIcon />
              Mark as sold
            </Button>
          ) : null}

          {status === 'active' || status === 'sold' ? (
            <Button variant="ghost" disabled={isPending} onClick={() => run(hideAction)}>
              <EyeOffIcon />
              Hide
            </Button>
          ) : null}

          {status !== 'active' ? (
            <Button disabled={isPending} onClick={() => run(restoreAction)}>
              <UploadIcon />
              {status === 'sold' ? 'Relist' : 'Publish'}
            </Button>
          ) : null}

          <DeleteListingDialog disabled={isPending} onConfirm={() => run(deleteAction)} />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
