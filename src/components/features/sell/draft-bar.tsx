'use client';

import { CheckIcon, ExternalLinkIcon, LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { DraftState } from './use-sell-listing';

interface DraftBarProps {
  state: DraftState;
  previewHref: string | null;
}

export function DraftBar({ state, previewHref }: DraftBarProps) {
  const t = useTranslations('sell.draft');

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
        {t(state)}
      </p>

      {previewHref ? (
        <Link
          href={previewHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          {t('preview')}
          <ExternalLinkIcon className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
