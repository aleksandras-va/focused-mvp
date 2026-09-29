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
      <Button type="button" disabled={isPending} onClick={() => onSubmit(false)}>
        Save changes
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" disabled={isPending} onClick={() => onSubmit(false)}>
        Save draft
      </Button>
      <Button type="button" disabled={isPending} onClick={() => onSubmit(true)}>
        Publish
      </Button>
    </div>
  );
}
