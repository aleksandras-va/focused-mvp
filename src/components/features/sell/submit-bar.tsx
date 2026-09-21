'use client';

import { Button } from '@/components/ui/button';

interface SubmitBarProps {
  isPending: boolean;
  onSubmit: (publish: boolean) => void;
}

export function SubmitBar({ isPending, onSubmit }: SubmitBarProps) {
  return (
    <div className="flex gap-3 mt-10">
      <Button type="button" disabled={isPending} onClick={() => onSubmit(true)}>
        Publish listing
      </Button>
      <Button type="button" variant="outline" disabled={isPending} onClick={() => onSubmit(false)}>
        Save as draft
      </Button>
    </div>
  );
}
