'use client';

import { CheckIcon, ExternalLinkIcon, LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DraftState } from './use-sell-listing';

interface DraftBarProps {
  state: DraftState;
  previewHref: string | null;
}

const MESSAGES: Record<DraftState, string | null> = {
  idle: 'Your ad saves itself as a draft as you fill it in.',
  saving: 'Saving draft…',
  saved: 'Draft saved — only you can see it.',
  error: 'Could not save the draft. Your last change is not stored.',
};

export function DraftBar({ state, previewHref }: DraftBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3">
      <p
        className={cn(
          'flex items-center gap-2 text-sm',
          state === 'error' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {state === 'saving' ? <LoaderIcon className="size-4 animate-spin" /> : null}
        {state === 'saved' ? <CheckIcon className="size-4" /> : null}
        {MESSAGES[state]}
      </p>

      {previewHref ? (
        <Link
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <ExternalLinkIcon />
          Preview draft
        </Link>
      ) : null}
    </div>
  );
}
