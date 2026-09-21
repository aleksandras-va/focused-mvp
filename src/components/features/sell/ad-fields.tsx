'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdFieldsProps {
  isBundle: boolean;
  bundlePrice: string;
  onBundlePriceChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function AdFields({
  isBundle,
  bundlePrice,
  onBundlePriceChange,
  description,
  onDescriptionChange,
}: AdFieldsProps) {
  return (
    <>
      {isBundle ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="bundlePrice">Bundle price (EUR)</FieldLabel>
            <Input
              id="bundlePrice"
              type="number"
              min="0"
              step="1"
              value={bundlePrice}
              onChange={(event) => onBundlePriceChange(event.target.value)}
            />
          </Field>
        </div>
      ) : null}

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          rows={5}
          placeholder="Anything a buyer should know: history, marks, why you are selling."
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </Field>
    </>
  );
}
