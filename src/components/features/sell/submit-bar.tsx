'use client';

import { Button } from '@/components/ui/button';

interface SubmitBarProps {
  isPending: boolean;
  isPublished: boolean;
  onSubmit: (publish: boolean) => void;
}

export function SubmitBar({ isPending, isPublished, onSubmit }: SubmitBarProps) {
  if (isPublished) {
    return (
      <Button
        type="button"
        className="self-start"
        disabled={isPending}
        onClick={() => onSubmit(false)}
      >
        Save changes
      </Button>
    );
  }

  return (
    <div className="flex gap-3">
      <Button type="button" disabled={isPending} onClick={() => onSubmit(true)}>
        Publish listing
      </Button>
      <Button type="button" variant="outline" disabled={isPending} onClick={() => onSubmit(false)}>
        Save as draft
      </Button>
    </div>
  );
}
