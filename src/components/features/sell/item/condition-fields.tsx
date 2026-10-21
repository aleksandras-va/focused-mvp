'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { ConditionScale } from '@/components/features/sell/item/condition-scale';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { COSMETIC_CONDITIONS, FUNCTIONAL_CONDITIONS } from '@/lib/listing-options';
import { keepDigits } from '@/lib/numeric-input';

interface ConditionFieldsProps {
  item: SellItem;
  isBundle: boolean;
  onChange: (patch: Partial<SellItem>) => void;
}

export function ConditionFields({ item, isBundle, onChange }: ConditionFieldsProps) {
  const t = useTranslations('sell.condition');
  const tEnums = useTranslations('enums');
  const shutterCountId = useId();
  const groupId = useId();
  const asksShutterCount = item.model
    ? item.model.category === 'camera' && !item.model.isFilm
    : item.custom?.category === 'camera';

  const isItemChosen = item.model !== null || item.custom !== null;

  return (
    <>
      <ConditionScale
        legend={t('cosmetic')}
        name={`${groupId}-cosmetic`}
        options={COSMETIC_CONDITIONS.map((condition) => ({
          value: condition,
          label: tEnums(`cosmeticCondition.${condition}`),
          hint: t(`hints.${condition}`),
        }))}
        value={item.cosmeticCondition}
        disabled={!isItemChosen}
        onChange={(cosmeticCondition) => onChange({ cosmeticCondition })}
      />

      <ConditionScale
        legend={t('functional')}
        name={`${groupId}-functional`}
        options={FUNCTIONAL_CONDITIONS.map((condition) => ({
          value: condition,
          label: tEnums(`functionalCondition.${condition}`),
        }))}
        value={item.functionalCondition}
        disabled={!isItemChosen}
        onChange={(functionalCondition) => onChange({ functionalCondition })}
      />

      {isBundle ? <p className="-mt-3 text-sm text-muted-foreground">{t('bundleHint')}</p> : null}

      {asksShutterCount ? (
        <Field className="max-w-xs">
          <FieldLabel htmlFor={shutterCountId}>{t('shutterCount')}</FieldLabel>
          <Input
            id={shutterCountId}
            type="text"
            inputMode="numeric"
            className="h-12 rounded-xl"
            value={item.shutterCount}
            onChange={(event) => onChange({ shutterCount: keepDigits(event.target.value) })}
          />
          <FieldDescription>{t('shutterHint')}</FieldDescription>
        </Field>
      ) : null}
    </>
  );
}
