'use client';

import { ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';

interface ItemSummaryRowProps {
  item: SellItem;
  index: number;
  onEdit: () => void;
}

export function ItemSummaryRow({ item, index, onEdit }: ItemSummaryRowProps) {
  const t = useTranslations('sell.summary');
  const tEnums = useTranslations('enums');
  const name = item.model?.displayName ?? (item.custom?.name || t('unnamed'));
  const isItemChosen = item.model !== null || item.custom !== null;
  const priceCents = Math.round(Number(item.price) * 100);
  const details = [
    isItemChosen ? tEnums(`cosmeticCondition.${item.cosmeticCondition}`) : null,
    isItemChosen ? tEnums(`functionalCondition.${item.functionalCondition}`) : null,
    item.shutterCount ? t('shutterCount', { count: Number(item.shutterCount) }) : null,
    item.inclusions.length > 0 ? t('included', { count: item.inclusions.length }) : null,
  ].filter(Boolean);

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border bg-muted/30 py-3.5 pr-3.5 pl-4">
      <span className="w-7 shrink-0 text-[0.8125rem] font-bold text-muted-foreground">
        #{index + 1}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-semibold">{name}</span>
        <span className="truncate text-[0.8125rem] text-muted-foreground">
          {details.join(' · ')}
        </span>
      </span>
      <span className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
        <span className="font-semibold">
          {item.price && Number.isFinite(priceCents) ? formatPrice(priceCents) : '-'}
        </span>
        <span className="text-xs text-muted-foreground">
          {item.soldSeparately ? t('alsoOnItsOwn') : t('bundleOnly')}
        </span>
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        {t('edit')}
        <ChevronDownIcon />
      </Button>
    </div>
  );
}
