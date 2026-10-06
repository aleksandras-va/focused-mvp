'use client';

import { useId } from 'react';
import { ChoiceGroup } from '@/components/features/sell/choice-group';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  COSMETIC_CONDITION_HINTS,
  COSMETIC_CONDITIONS,
  FUNCTIONAL_CONDITIONS,
} from '@/lib/listing-options';

interface ConditionFieldsProps {
  item: SellItem;
  onChange: (patch: Partial<SellItem>) => void;
}

export function ConditionFields({ item, onChange }: ConditionFieldsProps) {
  const shutterCountId = useId();
  const groupId = useId();
  const asksShutterCount = item.model
    ? item.model.category === 'camera' && !item.model.isFilm
    : item.custom?.category === 'camera';

  return (
    <>
      <ChoiceGroup
        legend="Cosmetic condition"
        name={`${groupId}-cosmetic`}
        minWidth="7.5rem"
        options={COSMETIC_CONDITIONS.map((condition) => ({
          ...condition,
          hint: COSMETIC_CONDITION_HINTS[condition.value],
        }))}
        value={item.cosmeticCondition}
        onChange={(cosmeticCondition) => onChange({ cosmeticCondition })}
      />

      <ChoiceGroup
        legend="Does everything work?"
        name={`${groupId}-functional`}
        minWidth="9.5rem"
        options={FUNCTIONAL_CONDITIONS}
        value={item.functionalCondition}
        onChange={(functionalCondition) => onChange({ functionalCondition })}
      />

      {asksShutterCount ? (
        <Field className="max-w-xs">
          <FieldLabel htmlFor={shutterCountId}>Shutter count</FieldLabel>
          <Input
            id={shutterCountId}
            type="number"
            min="0"
            step="1"
            className="h-12 rounded-xl"
            value={item.shutterCount}
            onChange={(event) => onChange({ shutterCount: event.target.value })}
          />
          <FieldDescription>Leave empty if your camera does not report it.</FieldDescription>
        </Field>
      ) : null}
    </>
  );
}
