'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import type { SellStepKey } from '@/components/features/sell/use-sell-listing';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  isPending: boolean;
  isPublished: boolean;
  missingSteps: SellStepKey[];
  previewHref: string | null;
  onPreview: (href: string) => void;
  onSubmit: (publish: boolean) => void;
  stacked?: boolean;
}

export function SubmitBar({
  isPending,
  isPublished,
  missingSteps,
  previewHref,
  onPreview,
  onSubmit,
  stacked,
}: SubmitBarProps) {
  const t = useTranslations('sell');

  if (isPublished) {
    return (
      <Button
        type="button"
        size={stacked ? 'lg' : 'default'}
        className={cn(stacked && 'w-full')}
        disabled={isPending}
        onClick={() => onSubmit(false)}
      >
        {t('submit.saveChanges')}
      </Button>
    );
  }

  const isIncomplete = missingSteps.length > 0;
  const size = stacked ? 'lg' : 'default';
  const previewClassName = cn('border-input', stacked ? 'w-full' : 'flex-1');
  const previewLabel = t('draft.preview');

  const openPreview = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    event.preventDefault();
    onPreview(href);
  };

  return (
    <div className={cn('flex gap-2', stacked && 'flex-col-reverse')}>
      {previewHref ? (
        <Link
          href={previewHref}
          onClick={(event) => openPreview(event, previewHref)}
          className={cn(buttonVariants({ variant: 'outline', size }), previewClassName)}
        >
          {previewLabel}
        </Link>
      ) : (
        <Button
          type="button"
          variant="outline"
          size={size}
          className={cn(previewClassName, 'text-muted-foreground disabled:opacity-100')}
          disabled
        >
          {previewLabel}
        </Button>
      )}
      <Button
        type="button"
        size={size}
        className={cn(stacked ? 'w-full' : 'flex-[1.4]')}
        disabled={isPending || isIncomplete}
        onClick={() => onSubmit(true)}
      >
        {t('submit.publish')}
      </Button>
    </div>
  );
}
