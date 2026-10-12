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
import { keepDigits } from '@/lib/numeric-input';

interface ConditionFieldsProps {
  item: SellItem;
  isBundle: boolean;
  onChange: (patch: Partial<SellItem>) => void;
}

export function ConditionFields({ item, isBundle, onChange }: ConditionFieldsProps) {
  const shutterCountId = useId();
  const groupId = useId();
  const asksShutterCount = item.model
    ? item.model.category === 'camera' && !item.model.isFilm
    : item.custom?.category === 'camera';

  const isItemChosen = item.model !== null || item.custom !== null;

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
        disabled={!isItemChosen}
        onChange={(cosmeticCondition) => onChange({ cosmeticCondition })}
      />

      <ChoiceGroup
        legend="Does everything work?"
        name={`${groupId}-functional`}
        minWidth="9.5rem"
        options={FUNCTIONAL_CONDITIONS}
        value={item.functionalCondition}
        disabled={!isItemChosen}
        onChange={(functionalCondition) => onChange({ functionalCondition })}
      />

      {isBundle ? (
        <p className="-mt-3 text-sm text-muted-foreground">
          You can say more about this item's condition in the ad description below.
        </p>
      ) : null}

      {asksShutterCount ? (
        <Field className="max-w-xs">
          <FieldLabel htmlFor={shutterCountId}>Shutter count</FieldLabel>
          <Input
            id={shutterCountId}
            type="text"
            inputMode="numeric"
            className="h-12 rounded-xl"
            value={item.shutterCount}
            onChange={(event) => onChange({ shutterCount: keepDigits(event.target.value) })}
          />
          <FieldDescription>Leave empty if your camera does not report it.</FieldDescription>
        </Field>
      ) : null}
    </>
  );
}
