'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { ConditionFields } from '@/components/features/sell/item/condition-fields';
import { ItemHeader } from '@/components/features/sell/item/header';
import { InclusionFields } from '@/components/features/sell/item/inclusion-fields';
import { ModelField } from '@/components/features/sell/item/model-field';
import { PriceFields } from '@/components/features/sell/item/price-fields';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
import type { SellItem } from '@/components/features/sell/use-sell-listing';
import { Field, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import type { Inclusion, ModelCategory } from '@/db/tables';
import { inclusionsFor } from '@/lib/listing-options';
import { MAX_PHOTOS } from '@/lib/photos';
import { cn } from '@/lib/utils';
import type { CustomItem } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';
import type { PhotoUpload } from '@/services/photo/photo.types';

interface ItemFieldsProps {
  item: SellItem;
  index: number;
  isBundle: boolean;
  siblingModels: CatalogModel[];
  searchAction: (term: string, preferredMountSlugs: string[]) => Promise<CatalogModel[]>;
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
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

function keepOffered(inclusions: Inclusion[], offered: Inclusion[]) {
  return inclusions.filter((inclusion) => offered.includes(inclusion));
}

export function ItemFields({
  item,
  index,
  isBundle,
  siblingModels,
  searchAction,
  uploadAction,
  onChange,
  onRemove,
}: ItemFieldsProps) {
  const t = useTranslations('sell');
  const descriptionId = useId();
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
    <div
      className={cn(
        'flex flex-col gap-6',
        isBundle && 'rounded-2xl border-2 border-foreground p-4 sm:p-5',
      )}
    >
      {isBundle ? <ItemHeader number={index + 1} onRemove={onRemove} /> : null}
      <ModelField
        model={item.model}
        custom={item.custom}
        siblingModels={siblingModels}
        searchAction={searchAction}
        onSelect={selectModel}
        onCustomChange={changeCustom}
        onClear={clearModel}
      />
      <ConditionFields item={item} isBundle={isBundle} onChange={onChange} />
      {availableInclusions.length > 0 ? (
        <InclusionFields
          options={availableInclusions}
          selected={item.inclusions}
          onToggle={toggleInclusion}
        />
      ) : null}

      <fieldset className="flex flex-col gap-2.5 border-t pt-6">
        <legend className="float-left mb-0.5 text-sm font-semibold">{t('photos.title')}</legend>
        <p className="clear-left text-xs text-muted-foreground">
          {t('photos.description', { max: MAX_PHOTOS })}
        </p>
        <PhotoUploader
          uploadAction={uploadAction}
          photos={item.photos}
          onChange={(photos) => onChange({ photos })}
        />
      </fieldset>

      <Field>
        <FieldLabel htmlFor={descriptionId}>{t('description.title')}</FieldLabel>
        <Textarea
          id={descriptionId}
          rows={4}
          placeholder={t('description.placeholder')}
          value={item.description}
          onChange={(event) => onChange({ description: event.target.value })}
          className="rounded-xl text-[0.9375rem]"
        />
      </Field>

      <PriceFields item={item} isBundle={isBundle} onChange={onChange} />
    </div>
  );
}
