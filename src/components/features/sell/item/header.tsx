'use client';

import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ItemHeaderProps {
  title: string;
  onRemove: (() => void) | null;
}

export function ItemHeader({ title, onRemove }: ItemHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove item"
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      ) : null}
    </CardHeader>
  );
}
