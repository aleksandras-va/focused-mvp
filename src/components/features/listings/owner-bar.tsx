'use client';

import { EyeOffIcon, PencilIcon, TagIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { DeleteListingDialog } from '@/components/features/listings/delete-listing-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { ListingStatus } from '@/db/tables';
import { cn } from '@/lib/utils';

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
    <div className="relative mb-6 flex flex-col gap-4 rounded-2xl border border-accent bg-accent/40 p-4 lg:flex-row lg:items-center lg:gap-2">
      <div className="flex flex-col gap-1 pr-10 lg:pr-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{t('yourAd')}</span>
          <Badge
            variant={status === 'active' ? 'outline' : 'default'}
            className={status === 'active' ? 'bg-background' : 'bg-foreground text-background'}
          >
            {tEnums(`listingStatus.${status}`)}
          </Badge>
        </div>
        {status === 'active' ? null : (
          <p className="text-sm text-muted-foreground">{t(`notices.${status}`)}</p>
        )}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:flex lg:items-center [&>*:last-child:nth-child(odd)]:col-span-2">
        <Link
          href={editHref}
          className={cn(buttonVariants({ variant: 'outline' }), 'border-input')}
        >
          <PencilIcon />
          {status === 'draft' ? t('continueEditing') : t('edit')}
        </Link>

        {status === 'active' || status === 'sold' ? (
          <Button
            variant="outline"
            className={cn('border-input', status === 'active' && 'lg:order-last')}
            disabled={isPending}
            onClick={() => run(hideAction)}
          >
            <EyeOffIcon />
            {t('hide')}
          </Button>
        ) : null}

        {status === 'active' ? (
          <Button
            variant="outline"
            className="border-input"
            disabled={isPending}
            onClick={() => run(markSoldAction)}
          >
            <TagIcon />
            {t('markSold')}
          </Button>
        ) : null}

        {status !== 'active' ? (
          <Button disabled={isPending} onClick={() => run(restoreAction)}>
            {status === 'sold' ? t('relist') : t('publish')}
          </Button>
        ) : null}
      </div>

      <div className="absolute top-3 right-3 lg:static lg:order-last">
        <DeleteListingDialog disabled={isPending} onConfirm={() => run(deleteAction)} />
      </div>
    </div>
  );
}
