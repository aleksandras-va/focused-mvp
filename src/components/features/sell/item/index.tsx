'use client';

import { ConditionFields } from '@/components/features/sell/item/condition-fields';
import { ItemHeader } from '@/components/features/sell/item/header';
import { InclusionFields } from '@/components/features/sell/item/inclusion-fields';
import { ModelField } from '@/components/features/sell/item/model-field';
import { PriceFields } from '@/components/features/sell/item/price-fields';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Card, CardContent } from '@/components/ui/card';
import type { Inclusion, ModelCategory } from '@/db/tables';
import { inclusionsFor } from '@/lib/listing-options';
import type { CustomItem } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

interface ItemFieldsProps {
  item: SellItem;
  index: number;
  isBundle: boolean;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  onChange: (patch: Partial<SellItem>) => void;
  onRemove: (() => void) | null;
}

function inclusionOptions(model: CatalogModel) {
  return inclusionsFor({
    category: model.category,
    isFilm: model.isFilm,
    hasMount: model.mount !== null,
  });
}

function customInclusionOptions(category: ModelCategory) {
  return inclusionsFor({ category, isFilm: false, hasMount: true });
}

function itemInclusionOptions(item: SellItem) {
  if (item.model) return inclusionOptions(item.model);
  if (item.custom?.category) return customInclusionOptions(item.custom.category);

  return [];
}

function keepOffered(inclusions: Inclusion[], options: { value: Inclusion }[]) {
  const offered = options.map(({ value }) => value);

  return inclusions.filter((inclusion) => offered.includes(inclusion));
}

export function ItemFields({
  item,
  index,
  isBundle,
  searchAction,
  onChange,
  onRemove,
}: ItemFieldsProps) {
  const availableInclusions = itemInclusionOptions(item);

  const selectModel = (model: CatalogModel) => {
    onChange({
      model,
      custom: null,
      inclusions: keepOffered(item.inclusions, inclusionOptions(model)),
    });
  };

  const clearModel = () => onChange({ model: null, inclusions: [] });

  const changeCustom = (custom: CustomItem | null) => {
    const options = custom?.category ? customInclusionOptions(custom.category) : [];

    onChange({
      model: null,
      custom,
      inclusions: keepOffered(item.inclusions, options),
    });
  };

  const toggleInclusion = (inclusion: Inclusion, checked: boolean) => {
    onChange({
      inclusions: checked
        ? [...item.inclusions, inclusion]
        : item.inclusions.filter((other) => other !== inclusion),
    });
  };

  return (
    <Card className="ring-foreground/20">
      {isBundle ? (
        <ItemHeader
          title={item.model?.displayName || item.custom?.name.trim() || `Item ${index + 1}`}
          onRemove={onRemove}
        />
      ) : null}

      <CardContent className="flex flex-col gap-6">
        <ModelField
          model={item.model}
          custom={item.custom}
          searchAction={searchAction}
          onSelect={selectModel}
          onCustomChange={changeCustom}
          onClear={clearModel}
        />
        <ConditionFields item={item} onChange={onChange} />
        {availableInclusions.length > 0 ? (
          <InclusionFields
            options={availableInclusions}
            selected={item.inclusions}
            onToggle={toggleInclusion}
          />
        ) : null}
        <PriceFields item={item} isBundle={isBundle} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
