'use client';

import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface AddItemPromptProps {
  isBundle: boolean;
  suggestLens: boolean;
  onAdd: () => void;
}

export function AddItemPrompt({ isBundle, suggestLens, onAdd }: AddItemPromptProps) {
  const t = useTranslations('sell.addItem');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-input bg-muted/30 px-4 py-3.5 sm:px-5">
      {isBundle ? (
        <span className="text-sm text-foreground/80">{t('bundle')}</span>
      ) : (
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">
            {suggestLens ? t('lensTitle') : t('moreTitle')}
          </span>
          <span className="text-[0.8125rem] text-muted-foreground">
            {suggestLens ? t('lensHint') : t('moreHint')}
          </span>
        </span>
      )}
      <Button type="button" variant="outline" onClick={onAdd}>
        <PlusIcon />
        {t('button')}
      </Button>
    </div>
  );
}
