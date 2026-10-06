'use client';

import { PriceInput } from '@/components/features/sell/price-input';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldLabel } from '@/components/ui/field';
import { formatPrice } from '@/lib/format';

interface BundlePriceFieldProps {
  items: SellItem[];
  value: string;
  onChange: (value: string) => void;
}

function toCents(value: string) {
  const euros = Number(value);

  return value.trim() !== '' && Number.isFinite(euros) ? Math.round(euros * 100) : null;
}

export function BundlePriceField({ items, value, onChange }: BundlePriceFieldProps) {
  const itemCents = items.map((item) => toCents(item.price));
  const sumCents = itemCents.every((cents) => cents !== null)
    ? itemCents.reduce<number>((sum, cents) => sum + (cents ?? 0), 0)
    : null;
  const bundleCents = toCents(value);
  const savingCents =
    sumCents !== null && bundleCents !== null && bundleCents < sumCents
      ? sumCents - bundleCents
      : null;

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-primary-soft p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field className="w-full max-w-56">
          <FieldLabel htmlFor="bundlePrice">Bundle price</FieldLabel>
          <PriceInput id="bundlePrice" value={value} onChange={onChange} large />
        </Field>
        {sumCents !== null ? (
          <dl className="flex min-w-60 flex-1 flex-col gap-1.5 pb-1 text-sm">
            <div className="flex justify-between gap-3 text-foreground/80">
              <dt>Items on their own</dt>
              <dd>{formatPrice(sumCents)}</dd>
            </div>
            {savingCents !== null ? (
              <div className="flex justify-between gap-3 font-semibold text-success">
                <dt>Buyers save</dt>
                <dd>{formatPrice(savingCents)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
      <p className="text-[0.8125rem] text-foreground/80">
        Below the items combined, and the ad gets a discount label.
      </p>
    </div>
  );
}
