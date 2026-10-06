'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitBarProps {
  isPending: boolean;
  isPublished: boolean;
  onSubmit: (publish: boolean) => void;
  stacked?: boolean;
}

export function SubmitBar({ isPending, isPublished, onSubmit, stacked }: SubmitBarProps) {
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

  return (
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
        type="button"
        size={stacked ? 'lg' : 'default'}
        className={cn(stacked ? 'w-full' : 'flex-[1.4]')}
        disabled={isPending}
        onClick={() => onSubmit(true)}
      >
        Publish ad
      </Button>
    </div>
  );
}
