'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ModelCategory } from '@/db/tables';
import type { CustomItem } from '@/services/listing/listing.types';

const CATEGORIES: ModelCategory[] = ['camera', 'lens', 'accessory'];

interface CustomItemFieldsProps {
  custom: CustomItem;
  onChange: (custom: CustomItem) => void;
  onBackToCatalog: () => void;
}

export function CustomItemFields({ custom, onChange, onBackToCatalog }: CustomItemFieldsProps) {
  const t = useTranslations('sell.custom');
  const tEnums = useTranslations('enums');
  const nameId = useId();

  return (
    <Field>
      <div className="flex items-center justify-between gap-4">
        <FieldLabel htmlFor={nameId}>{t('label')}</FieldLabel>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-muted-foreground"
          onClick={onBackToCatalog}
        >
          {t('back')}
        </Button>
      </div>
      <ToggleGroup
        variant="outline"
        spacing={0}
        value={custom.category ? [custom.category] : []}
        onValueChange={(value) => {
          const category = value[0] as ModelCategory | undefined;
          if (category) onChange({ ...custom, category });
        }}
      >
        {CATEGORIES.map((category) => (
          <ToggleGroupItem
            key={category}
            value={category}
            className="aria-pressed:bg-primary-soft aria-pressed:text-primary-ink"
          >
            {tEnums(`category.${category}`)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Input
        id={nameId}
        placeholder={t('placeholder')}
        value={custom.name}
        onChange={(event) => onChange({ ...custom, name: event.target.value })}
      />
      {custom.category === 'accessory' ? null : <FieldDescription>{t('hint')}</FieldDescription>}
    </Field>
  );
}
