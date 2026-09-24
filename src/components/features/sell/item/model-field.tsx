'use client';

import { CustomItemFields } from '@/components/features/sell/item/custom-item-fields';
import { ModelPicker } from '@/components/features/sell/item/model-picker';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import type { CustomItem } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

interface ModelFieldProps {
  model: CatalogModel | null;
  custom: CustomItem | null;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  onSelect: (model: CatalogModel) => void;
  onCustomChange: (custom: CustomItem | null) => void;
  onClear: () => void;
}

export function ModelField({
  model,
  custom,
  searchAction,
  onSelect,
  onCustomChange,
  onClear,
}: ModelFieldProps) {
  if (custom) {
    return (
      <CustomItemFields
        custom={custom}
        onChange={onCustomChange}
        onBackToCatalog={() => onCustomChange(null)}
      />
    );
  }

  const addByName = (name: string) => onCustomChange({ name, category: null });

  return (
    <Field>
      <FieldLabel>Model</FieldLabel>
      <ModelPicker
        searchAction={searchAction}
        selected={model}
        onSelect={onSelect}
        onAddByName={addByName}
      />
      {model ? (
        <FieldDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {`${model.brand.name} - ${CATEGORY_LABELS[model.category]}${model.isFilm ? ' · Film' : ''}`}
          </span>
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onClear}>
            Clear
          </Button>
        </FieldDescription>
      ) : (
        <FieldDescription className="text-center">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => addByName('')}
          >
            Can't find it? Add it by name
          </Button>
        </FieldDescription>
      )}
    </Field>
  );
}
