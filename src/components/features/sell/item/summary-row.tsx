'use client';

import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Button } from '@/components/ui/button';
import { formatCount } from '@/lib/format';
import { LISTING_LABELS } from '@/lib/listing-options';

interface ItemSummaryRowProps {
  item: SellItem;
  index: number;
  onEdit: () => void;
}

export function ItemSummaryRow({ item, index, onEdit }: ItemSummaryRowProps) {
  const name = item.model?.displayName ?? (item.custom?.name || 'Unnamed item');
  const details = [
    LISTING_LABELS.get(item.cosmeticCondition),
    LISTING_LABELS.get(item.functionalCondition),
    item.shutterCount ? `${formatCount(Number(item.shutterCount))} shots` : null,
    item.inclusions.length > 0 ? `${item.inclusions.length} included` : null,
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
        <span className="font-semibold">{item.price ? `€${item.price}` : '—'}</span>
        <span className="text-xs text-muted-foreground">
          {item.soldSeparately ? 'Also on its own' : 'Bundle only'}
        </span>
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}
