'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  isPending: boolean;
  isPublished: boolean;
  missingStepLabels: string[];
  onSubmit: (publish: boolean) => void;
  stacked?: boolean;
}

export function SubmitBar({
  isPending,
  isPublished,
  missingStepLabels,
  onSubmit,
  stacked,
}: SubmitBarProps) {
  if (isPublished) {
    return (
      <Button
        type="button"
        size={stacked ? 'lg' : 'default'}
        className={cn(stacked && 'w-full')}
        disabled={isPending}
        onClick={() => onSubmit(false)}
      >
        Save changes
      </Button>
    );
  }

  const isIncomplete = missingStepLabels.length > 0;

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
          Save draft
        </Button>
        <Button
          variant="tertiary"
          type="button"
          size={stacked ? 'lg' : 'default'}
          className={cn(stacked ? 'w-full' : 'flex-[1.4]')}
          disabled={isPending || isIncomplete}
          onClick={() => onSubmit(true)}
        >
          Publish ad
        </Button>
      </div>
      {isIncomplete ? (
        <p className="text-center text-xs text-muted-foreground">
          Still needed: {missingStepLabels.join(', ')}
        </p>
      ) : null}
    </div>
  );
}
