'use client';

import { EyeOffIcon, PencilIcon, TagIcon, UndoIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { DeleteListingDialog } from '@/components/features/listings/delete-listing-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import type { ListingStatus } from '@/db/tables';
import { cn } from '@/lib/utils';

type OwnerAction = (listingId: string) => Promise<{ error: string | null }>;
type ItemAction = (itemId: string) => Promise<{ error: string | null }>;

export interface OwnerBarItem {
  id: string;
  isSold: boolean;
  inBundle: boolean;
}

interface OwnerBarProps {
  listingId: string;
  status: ListingStatus;
  item: OwnerBarItem | null;
  editHref: string;
  markSoldAction: OwnerAction;
  markItemSoldAction: ItemAction | null;
  unmarkItemSoldAction: ItemAction | null;
  hideAction: OwnerAction;
  restoreAction: OwnerAction;
  deleteAction: OwnerAction;
}

export function OwnerBar({
  listingId,
  status,
  item,
  editHref,
  markSoldAction,
  markItemSoldAction,
  unmarkItemSoldAction,
  hideAction,
  restoreAction,
  deleteAction,
}: OwnerBarProps) {
  const t = useTranslations('listing.owner');
  const tEnums = useTranslations('enums');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isItemSold = item?.isSold ?? false;
  const canSellItem = status === 'active' && item?.inBundle && !isItemSold && markItemSoldAction;
  const canUnsellItem = item && isItemSold && unmarkItemSoldAction;

  const run = (action: () => Promise<{ error: string | null }>) => {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="relative mb-6 flex flex-col gap-4 rounded-2xl border border-accent bg-accent/40 p-4 lg:flex-row lg:items-center lg:gap-2">
      <div className="flex flex-col gap-1 pr-10 lg:pr-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{t('yourAd')}</span>
          <Badge
            variant={status === 'active' && !isItemSold ? 'outline' : 'default'}
            className={
              status === 'active' && !isItemSold ? 'bg-background' : 'bg-foreground text-background'
            }
          >
            {isItemSold ? tEnums('listingStatus.sold') : tEnums(`listingStatus.${status}`)}
          </Badge>
        </div>
        {isItemSold ? (
          <p className="text-sm text-muted-foreground">{t('notices.itemSold')}</p>
        ) : status === 'active' ? null : (
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
            onClick={() => run(() => hideAction(listingId))}
          >
            <EyeOffIcon />
            {t('hide')}
          </Button>
        ) : null}

        {canSellItem ? (
          <Button
            variant="outline"
            className="border-input"
            disabled={isPending}
            onClick={() => run(() => markItemSoldAction(item.id))}
          >
            <TagIcon />
            {t('markItemSold')}
          </Button>
        ) : null}

        {canUnsellItem ? (
          <Button
            variant="outline"
            className="border-input"
            disabled={isPending}
            onClick={() => run(() => unmarkItemSoldAction(item.id))}
          >
            <UndoIcon />
            {t('unmarkItemSold')}
          </Button>
        ) : null}

        {status === 'active' ? (
          <Button
            variant="outline"
            className="border-input"
            disabled={isPending}
            onClick={() => run(() => markSoldAction(listingId))}
          >
            <TagIcon />
            {item?.inBundle ? t('markAllSold') : t('markSold')}
          </Button>
        ) : null}

        {status !== 'active' ? (
          <Button disabled={isPending} onClick={() => run(() => restoreAction(listingId))}>
            {status === 'sold' ? t('relist') : t('publish')}
          </Button>
        ) : null}
      </div>

      <div className="absolute top-3 right-3 lg:static lg:order-last">
        <DeleteListingDialog
          disabled={isPending}
          onConfirm={() => run(() => deleteAction(listingId))}
        />
      </div>
    </div>
  );
}
