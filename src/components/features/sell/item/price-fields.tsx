'use client';

import { useId } from 'react';
import { PriceInput } from '@/components/features/sell/price-input';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface PriceFieldsProps {
  item: SellItem;
  isBundle: boolean;
  onChange: (patch: Partial<SellItem>) => void;
}

export function PriceFields({ item, isBundle, onChange }: PriceFieldsProps) {
  const priceId = useId();

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-4 border-t pt-6">
      <Field className="w-full max-w-56">
        <FieldLabel htmlFor={priceId}>{isBundle ? 'Price on its own' : 'Price'}</FieldLabel>
        <PriceInput id={priceId} value={item.price} onChange={(price) => onChange({ price })} />
        {isBundle ? <FieldDescription>What this item alone would cost.</FieldDescription> : null}
      </Field>

      {isBundle ? (
        <label
          className={cn(
            'flex min-w-60 flex-1 cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 sm:mt-7',
            item.soldSeparately ? 'border-success/40 bg-success/8' : 'border-input',
          )}
        >
          <input
            type="checkbox"
            checked={item.soldSeparately}
            onChange={(event) => onChange({ soldSeparately: event.target.checked })}
            className="mt-0.5 size-4.5 accent-(--color-success)"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">Would sell this item separately</span>
            <span className="text-xs text-muted-foreground">
              Buyers looking for just this item can find it too.
            </span>
          </span>
        </label>
      ) : null}
    </div>
  );
}
