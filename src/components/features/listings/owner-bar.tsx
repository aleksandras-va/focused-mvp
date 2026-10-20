'use client';

import { EyeOffIcon, PencilIcon, TagIcon, UploadIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { DeleteListingDialog } from '@/components/features/listings/delete-listing-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { ListingStatus } from '@/db/tables';

type OwnerAction = (listingId: string) => Promise<{ error: string | null }>;

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
  const t = useTranslations('listing.owner');
  const tEnums = useTranslations('enums');
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
            <span className="font-medium">{t('yourAd')}</span>
            <Badge
              variant={status === 'active' ? 'outline' : 'default'}
              className={status === 'active' ? 'bg-background' : undefined}
            >
              {tEnums(`listingStatus.${status}`)}
            </Badge>
          </div>
          {status === 'active' ? null : (
            <p className="text-sm text-muted-foreground">{t(`notices.${status}`)}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={editHref} className={buttonVariants({ variant: 'outline' })}>
            <PencilIcon />
            {status === 'draft' ? t('continueEditing') : t('edit')}
          </Link>

          {status === 'active' ? (
            <Button variant="outline" disabled={isPending} onClick={() => run(markSoldAction)}>
              <TagIcon />
              {t('markSold')}
            </Button>
          ) : null}

          {status === 'active' || status === 'sold' ? (
            <Button variant="ghost" disabled={isPending} onClick={() => run(hideAction)}>
              <EyeOffIcon />
              {t('hide')}
            </Button>
          ) : null}

          {status !== 'active' ? (
            <Button disabled={isPending} onClick={() => run(restoreAction)}>
              <UploadIcon />
              {status === 'sold' ? t('relist') : t('publish')}
            </Button>
          ) : null}

          <DeleteListingDialog disabled={isPending} onConfirm={() => run(deleteAction)} />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
