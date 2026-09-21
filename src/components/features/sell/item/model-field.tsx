'use client';

import { ModelPicker } from '@/components/features/sell/item/model-picker';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

interface ModelFieldProps {
  model: CatalogModel | null;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  onSelect: (model: CatalogModel) => void;
}

export function ModelField({ model, searchAction, onSelect }: ModelFieldProps) {
  return (
    <Field>
      <FieldLabel>Model</FieldLabel>
      <ModelPicker searchAction={searchAction} selected={model} onSelect={onSelect} />
      {model ? (
        <FieldDescription>
          {`${model.brand.name} - ${CATEGORY_LABELS[model.category]}${model.isFilm ? ' · Film' : ''}`}
        </FieldDescription>
      ) : null}
    </Field>
  );
}
