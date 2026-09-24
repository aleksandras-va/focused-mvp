'use client';

import { useId } from 'react';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CosmeticCondition, FunctionalCondition } from '@/db/tables';
import { COSMETIC_CONDITIONS, FUNCTIONAL_CONDITIONS } from '@/lib/listing-options';

interface ConditionFieldsProps {
  item: SellItem;
  onChange: (patch: Partial<SellItem>) => void;
}

export function ConditionFields({ item, onChange }: ConditionFieldsProps) {
  const shutterCountId = useId();
  const asksShutterCount = item.model
    ? item.model.category === 'camera' && !item.model.isFilm
    : item.custom?.category === 'camera';

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field>
        <FieldLabel>Cosmetic condition</FieldLabel>
        <Select
          value={item.cosmeticCondition}
          onValueChange={(value) => onChange({ cosmeticCondition: value as CosmeticCondition })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COSMETIC_CONDITIONS.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Functional condition</FieldLabel>
        <Select
          value={item.functionalCondition}
          onValueChange={(value) => onChange({ functionalCondition: value as FunctionalCondition })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUNCTIONAL_CONDITIONS.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {asksShutterCount ? (
        <Field>
          <FieldLabel htmlFor={shutterCountId}>Shutter count</FieldLabel>
          <Input
            id={shutterCountId}
            type="number"
            min="0"
            step="1"
            value={item.shutterCount}
            onChange={(event) => onChange({ shutterCount: event.target.value })}
          />
          <FieldDescription>Leave empty if your camera does not report it.</FieldDescription>
        </Field>
      ) : null}
    </div>
  );
}
