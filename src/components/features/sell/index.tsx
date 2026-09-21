'use client';

import { PlusIcon, XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { ModelPicker } from '@/components/features/sell/model-picker';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CosmeticCondition, FunctionalCondition, Inclusion } from '@/db/tables';
import {
  CATEGORY_LABELS,
  COSMETIC_CONDITIONS,
  FUNCTIONAL_CONDITIONS,
  INCLUSIONS,
} from '@/lib/listing-options';
import type { CreateListingPayload } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';
import type { PhotoUpload } from '@/services/photo/photo.types';

type ItemState = {
  key: number;
  model: CatalogModel | null;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string;
  soldSeparately: boolean;
  inclusions: Inclusion[];
};

type SellListingProps = {
  createAction: (payload: CreateListingPayload) => Promise<{ error: string }>;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
  defaults: { email: string; phone: string; location: string };
};

let nextKey = 1;

function emptyItem(): ItemState {
  return {
    key: nextKey++,
    model: null,
    price: '',
    cosmeticCondition: 'good',
    functionalCondition: 'fully_working',
    shutterCount: '',
    soldSeparately: true,
    inclusions: [],
  };
}

export function SellListing({
  createAction,
  searchAction,
  uploadAction,
  defaults,
}: SellListingProps) {
  const [items, setItems] = useState<ItemState[]>(() => [emptyItem()]);
  const [bundlePrice, setBundlePrice] = useState('');
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [location, setLocation] = useState(defaults.location);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(defaults.email);
  const [contactPhone, setContactPhone] = useState(defaults.phone);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isBundle = items.length > 1;
  const suggestLens =
    !isBundle && items.some((item) => item.model?.category === 'camera' && item.model.mount);

  function updateItem(key: number, patch: Partial<ItemState>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function submit(publish: boolean) {
    startTransition(async () => {
      const result = await createAction({
        items: items.map((item) => ({
          modelId: item.model?.id ?? '',
          price: item.price,
          cosmeticCondition: item.cosmeticCondition,
          functionalCondition: item.functionalCondition,
          shutterCount: item.shutterCount || null,
          soldSeparately: item.soldSeparately,
          inclusions: item.inclusions,
        })),
        bundlePrice: isBundle ? bundlePrice : null,
        photoKeys,
        location,
        description: description || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        publish,
      });

      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <FieldSet>
        <FieldLegend>Photos</FieldLegend>
        <PhotoUploader uploadAction={uploadAction} onChange={setPhotoKeys} />
      </FieldSet>

      {items.map((item, index) => (
        <ItemFields
          key={item.key}
          item={item}
          index={index}
          isBundle={isBundle}
          searchAction={searchAction}
          onChange={(patch) => updateItem(item.key, patch)}
          onRemove={
            isBundle
              ? () => setItems((current) => current.filter((other) => other.key !== item.key))
              : null
          }
        />
      ))}

      <div className="flex flex-col gap-3">
        <Alert variant="neutral" className="flex justify-between items-center">
          <div>
            <AlertTitle>
              {suggestLens ? 'Selling a lens with it?' : 'Selling more than one item?'}
            </AlertTitle>
            <AlertDescription>
              {suggestLens
                ? 'Add it as its own item — buyers searching for the lens will find your ad too.'
                : 'Add another item and this ad becomes a bundle.'}
            </AlertDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setItems((current) => [...current, emptyItem()])}
          >
            <PlusIcon />
            Add another item
          </Button>
        </Alert>
        {isBundle ? (
          <Alert variant="neutral">
            <AlertDescription>
              This ad will be listed as a bundle. Set a price for the whole bundle and one per item
              — if the bundle costs less than the items combined, the ad gets a discount label.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {isBundle ? (
          <Field>
            <FieldLabel htmlFor="bundlePrice">Bundle price (EUR)</FieldLabel>
            <Input
              id="bundlePrice"
              type="number"
              min="0"
              step="1"
              value={bundlePrice}
              onChange={(event) => setBundlePrice(event.target.value)}
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            placeholder="Vilnius"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          rows={5}
          placeholder="Anything a buyer should know: history, marks, why you are selling."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>

      <FieldSet>
        <FieldLegend>Contact</FieldLegend>
        <FieldDescription>
          Prefilled from your profile — edit it for this listing only.
        </FieldDescription>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactEmail">Email</FieldLabel>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactPhone">Phone</FieldLabel>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="+370…"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </Field>
        </div>
      </FieldSet>

      <div className="flex gap-3">
        <Button type="button" disabled={isPending} onClick={() => submit(true)}>
          Publish listing
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => submit(false)}>
          Save as draft
        </Button>
      </div>
    </div>
  );
}

type ItemFieldsProps = {
  item: ItemState;
  index: number;
  isBundle: boolean;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  onChange: (patch: Partial<ItemState>) => void;
  onRemove: (() => void) | null;
};

function ItemFields({ item, index, isBundle, searchAction, onChange, onRemove }: ItemFieldsProps) {
  const asksShutterCount = item.model?.category === 'camera' && !item.model.isFilm;

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {item.model ? item.model.displayName : `Item ${index + 1}`}
          </CardTitle>
          {onRemove ? (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
              <XIcon />
            </Button>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent className="flex flex-col gap-6">
        <Field>
          <FieldLabel>Model</FieldLabel>
          <ModelPicker
            searchAction={searchAction}
            selected={item.model}
            onSelect={(model) => onChange({ model })}
          />
          {item.model && (
            <FieldDescription>
              {`${item.model.brand.name} - ${CATEGORY_LABELS[item.model.category]}${item.model.isFilm ? ' · Film' : ''}`}
            </FieldDescription>
          )}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel>Cosmetic condition</FieldLabel>
            <Select
              value={item.cosmeticCondition}
              onValueChange={(value) => onChange({ cosmeticCondition: value as CosmeticCondition })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COSMETIC_CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Functional condition</FieldLabel>
            <Select
              value={item.functionalCondition}
              onValueChange={(value) =>
                onChange({ functionalCondition: value as FunctionalCondition })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUNCTIONAL_CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {asksShutterCount ? (
            <Field>
              <FieldLabel htmlFor={`shutterCount-${item.key}`}>Shutter count</FieldLabel>
              <Input
                id={`shutterCount-${item.key}`}
                type="number"
                min="0"
                step="1"
                value={item.shutterCount}
                onChange={(event) => onChange({ shutterCount: event.target.value })}
              />
              <FieldDescription>Leave empty if your camera does not report it.</FieldDescription>
            </Field>
          ) : null}
        </div>

        <FieldSet>
          <FieldLegend>What is included</FieldLegend>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUSIONS.map((inclusion) => (
              <Label key={inclusion.value} className="flex items-center gap-2 font-normal">
                <Checkbox
                  checked={item.inclusions.includes(inclusion.value)}
                  onCheckedChange={(checked) => toggleInclusion(inclusion.value, checked === true)}
                />
                {inclusion.label}
              </Label>
            ))}
          </div>
        </FieldSet>

        <div className="grid gap-6 sm:grid-cols-2 border-t pt-3">
          <Field>
            <FieldLabel htmlFor={`price-${item.key}`}>
              {isBundle ? 'Price on its own (EUR)' : 'Price (EUR)'}
            </FieldLabel>

            <Input
              id={`price-${item.key}`}
              type="number"
              placeholder="€0.00"
              value={item.price}
              className="w-1/2!"
              onChange={(event) => onChange({ price: event.target.value })}
            />
            {isBundle ? (
              <FieldDescription>What this item alone would cost.</FieldDescription>
            ) : null}
          </Field>

          {isBundle ? (
            <Label className="flex items-center gap-2 self-center font-normal">
              <Checkbox
                checked={item.soldSeparately}
                onCheckedChange={(checked) => onChange({ soldSeparately: checked === true })}
              />
              Would sell this item separately
            </Label>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
