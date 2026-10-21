'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CustomItemFields } from '@/components/features/sell/item/custom-item-fields';
import { ModelPicker } from '@/components/features/sell/item/model-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import type { CustomItem } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

interface ModelFieldProps {
  model: CatalogModel | null;
  custom: CustomItem | null;
  siblingModels: CatalogModel[];
  searchAction: (term: string, preferredMountSlugs: string[]) => Promise<CatalogModel[]>;
  onSelect: (model: CatalogModel) => void;
  onCustomChange: (custom: CustomItem | null) => void;
  onClear: () => void;
}

export function ModelField({
  model,
  custom,
  siblingModels,
  searchAction,
  onSelect,
  onCustomChange,
  onClear,
}: ModelFieldProps) {
  const t = useTranslations('sell.item');
  const tEnums = useTranslations('enums');
  const [parkedCustom, setParkedCustom] = useState<CustomItem | null>(null);

  const backToCatalog = (current: CustomItem) => {
    setParkedCustom(current);
    onCustomChange(null);
  };

  if (custom) {
    return (
      <CustomItemFields
        custom={custom}
        onChange={onCustomChange}
        onBackToCatalog={() => backToCatalog(custom)}
      />
    );
  }

  const addByName = ({ name, category }: CustomItem) =>
    onCustomChange({ name, category: category ?? parkedCustom?.category ?? 'camera' });
  const reopenCustom = () => onCustomChange(parkedCustom ?? { name: '', category: 'camera' });

  return (
    <Field>
      <FieldLabel>{t('model')}</FieldLabel>
      <ModelPicker
        siblingModels={siblingModels}
        searchAction={searchAction}
        selected={model}
        onSelect={onSelect}
        onAddByName={addByName}
      />
      {model ? (
        <FieldDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {`${model.brand.name} - ${tEnums(`category.${model.category}`)}${model.isFilm ? ` · ${t('film')}` : ''}`}
          </span>
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onClear}>
            {t('clear')}
          </Button>
        </FieldDescription>
      ) : (
        <FieldDescription className="text-left">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-muted-foreground hover:text-foreground"
            onClick={reopenCustom}
          >
            {t('cantFind')}
          </Button>
        </FieldDescription>
      )}
    </Field>
  );
}
