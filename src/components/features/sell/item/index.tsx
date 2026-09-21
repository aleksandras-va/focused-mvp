'use client';

import { ConditionFields } from '@/components/features/sell/item/condition-fields';
import { ItemHeader } from '@/components/features/sell/item/header';
import { InclusionFields } from '@/components/features/sell/item/inclusion-fields';
import { ModelField } from '@/components/features/sell/item/model-field';
import { PriceFields } from '@/components/features/sell/item/price-fields';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Card, CardContent } from '@/components/ui/card';
import type { Inclusion } from '@/db/tables';
import { inclusionsFor } from '@/lib/listing-options';
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

export function ItemFields({
  item,
  index,
  isBundle,
  searchAction,
  onChange,
  onRemove,
}: ItemFieldsProps) {
  const availableInclusions = item.model ? inclusionOptions(item.model) : [];

  const selectModel = (model: CatalogModel) => {
    const offered = inclusionOptions(model).map(({ value }) => value);
    onChange({
      model,
      inclusions: item.inclusions.filter((inclusion) => offered.includes(inclusion)),
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
          title={item.model ? item.model.displayName : `Item ${index + 1}`}
          onRemove={onRemove}
        />
      ) : null}

      <CardContent className="flex flex-col gap-6">
        <ModelField model={item.model} searchAction={searchAction} onSelect={selectModel} />
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
