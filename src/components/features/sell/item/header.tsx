'use client';

import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemHeaderProps {
  title: string;
  onRemove: (() => void) | null;
}

export function ItemHeader({ title, onRemove }: ItemHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.9375rem] font-bold">{title}</span>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${title.toLowerCase()}`}
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}
