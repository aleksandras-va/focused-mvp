'use client';

import { CheckIcon, LoaderIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DraftState } from './use-sell-listing';

interface DraftBarProps {
  state: DraftState;
  className?: string;
}

export function DraftBar({ state, className }: DraftBarProps) {
  const t = useTranslations('sell.draft');

  return (
    <p
      className={cn(
        'flex items-center gap-2 text-sm',
        state === 'error' ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
    >
      {state === 'saving' ? <LoaderIcon className="size-4 animate-spin" /> : null}
      {state === 'saved' ? <CheckIcon className="size-4 text-success" /> : null}
      {t(state)}
    </p>
  );
}
