'use client';

import { useId } from 'react';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceFieldsProps {
  item: SellItem;
  isBundle: boolean;
  onChange: (patch: Partial<SellItem>) => void;
}

export function PriceFields({ item, isBundle, onChange }: PriceFieldsProps) {
  const priceId = useId();

  return (
    <div className="grid gap-6 sm:grid-cols-2 border-t pt-3">
      <Field>
        <FieldLabel htmlFor={priceId}>
          {isBundle ? 'Price on its own (EUR)' : 'Price (EUR)'}
        </FieldLabel>
        <Input
          id={priceId}
          type="number"
          placeholder="€0.00"
          value={item.price}
          className="w-1/2!"
          onChange={(event) => onChange({ price: event.target.value })}
        />
        {isBundle ? <FieldDescription>What this item alone would cost.</FieldDescription> : null}
      </Field>

      {isBundle ? (
        <Label className="flex items-center gap-2 self-center font-normal">
          <Checkbox
            checked={item.soldSeparately}
            onCheckedChange={(checked) => onChange({ soldSeparately: checked === true })}
          />
          Would sell this item separately
        </Label>
      ) : null}
    </div>
  );
}
