'use client';

import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { DeleteListingDialog } from '@/components/features/listings/delete-listing-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { ListingStatus } from '@/db/tables';
import { LISTING_STATUS_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';

type OwnerAction = (listingId: string) => Promise<{ error: string | null }>;

const NOT_PUBLIC_NOTICES: Record<ListingStatus, string> = {
  draft: 'Not published yet — this page is a preview only you can see.',
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
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-medium">This is your ad</p>
        <Badge variant={status === 'active' ? 'secondary' : 'default'}>
          {LISTING_STATUS_LABELS[status]}
        </Badge>
      </div>

      {status === 'active' ? null : (
        <p className="text-sm text-muted-foreground">{NOT_PUBLIC_NOTICES[status]}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={editHref} className={cn(buttonVariants({ variant: 'outline' }))}>
          <PencilIcon />
          {status === 'draft' ? 'Continue editing' : 'Edit'}
        </Link>

        {status === 'active' ? (
          <Button variant="outline" disabled={isPending} onClick={() => run(markSoldAction)}>
            Mark as sold
          </Button>
        ) : null}

        {status === 'active' || status === 'sold' ? (
          <Button variant="outline" disabled={isPending} onClick={() => run(hideAction)}>
            Hide
          </Button>
        ) : null}

        {status !== 'active' ? (
          <Button variant="outline" disabled={isPending} onClick={() => run(restoreAction)}>
            {status === 'sold' ? 'Relist' : 'Publish'}
          </Button>
        ) : null}

        <DeleteListingDialog disabled={isPending} onConfirm={() => run(deleteAction)} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
