'use client';

import { useTranslations } from 'next-intl';
import type { SellStepKey } from '@/components/features/sell/use-sell-listing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  isPending: boolean;
  isPublished: boolean;
  missingSteps: SellStepKey[];
  onSubmit: (publish: boolean) => void;
  stacked?: boolean;
}

export function SubmitBar({
  isPending,
  isPublished,
  missingSteps,
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

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex gap-2', stacked && 'flex-col-reverse')}>
        <Button
          type="button"
          variant="outline"
          size={stacked ? 'lg' : 'default'}
          className={cn('border-input', stacked ? 'w-full' : 'flex-1')}
          disabled={isPending}
          onClick={() => onSubmit(false)}
        >
          {t('submit.saveDraft')}
        </Button>
        <Button
          variant="tertiary"
          type="button"
          size={stacked ? 'lg' : 'default'}
          className={cn(stacked ? 'w-full' : 'flex-[1.4]')}
          disabled={isPending || isIncomplete}
          onClick={() => onSubmit(true)}
        >
          {t('submit.publish')}
        </Button>
      </div>
      {isIncomplete ? (
        <p className="text-center text-xs text-muted-foreground">
          {t('submit.stillNeeded', {
            steps: missingSteps.map((step) => t(`steps.${step}`)).join(', '),
          })}
        </p>
      ) : null}
    </div>
  );
}
