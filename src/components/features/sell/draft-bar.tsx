'use client';

import { CheckIcon, ExternalLinkIcon, LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { DraftState } from './use-sell-listing';

interface DraftBarProps {
  state: DraftState;
  previewHref: string | null;
}

const MESSAGES: Record<DraftState, string | null> = {
  idle: 'Saves itself as a draft as you go.',
  saving: 'Saving draft…',
  saved: 'Draft saved — only you can see it.',
  error: 'Could not save the draft. Your last change is not stored.',
};

export function DraftBar({ state, previewHref }: DraftBarProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <p
        className={cn(
          'flex items-center gap-2',
          state === 'error' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {state === 'saving' ? <LoaderIcon className="size-4 animate-spin" /> : null}
        {state === 'saved' ? <CheckIcon className="size-4 text-success" /> : null}
        {MESSAGES[state]}
      </p>

      {previewHref ? (
        <Link
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          Preview
          <ExternalLinkIcon className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
