'use client';

import { useState } from 'react';
import { ModelPicker } from '@/components/features/sell/model-picker';
import { Button } from '@/components/ui/button';
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
import { COSMETIC_CONDITIONS, FUNCTIONAL_CONDITIONS, INCLUSIONS } from '@/lib/listing-options';
import type { CatalogModel } from '@/services/catalog-service';

type SellListingProps = {
  createAction: (formData: FormData) => Promise<void>;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  error?: string;
};

export function SellListing({ createAction, searchAction, error }: SellListingProps) {
  const [model, setModel] = useState<CatalogModel | null>(null);

  return (
    <form action={createAction} className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">List your gear</h1>
        <p className="text-muted-foreground">
          Pick the exact model so buyers can find it, then fill in what they always ask about.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Field>
        <FieldLabel>Model</FieldLabel>
        <ModelPicker searchAction={searchAction} selected={model} onSelect={setModel} />
        <FieldDescription>
          {model
            ? `${model.brand.name} · ${model.category === 'camera' ? 'Camera' : 'Lens'}`
            : 'Spelling does not matter — “Fuji XT3” finds the X-T3.'}
        </FieldDescription>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="price">Price (EUR)</FieldLabel>
          <Input id="price" name="price" type="number" min="0" step="1" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input id="location" name="location" required placeholder="Vilnius" />
        </Field>

        <Field>
          <FieldLabel>Cosmetic condition</FieldLabel>
          <Select name="cosmeticCondition" defaultValue="good" required>
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
          <Select name="functionalCondition" defaultValue="fully_working" required>
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

        {model?.category === 'camera' ? (
          <Field>
            <FieldLabel htmlFor="shutterCount">Shutter count</FieldLabel>
            <Input id="shutterCount" name="shutterCount" type="number" min="0" step="1" />
            <FieldDescription>Leave empty if your camera does not report it.</FieldDescription>
          </Field>
        ) : null}
      </div>

      <FieldSet>
        <FieldLegend>What is included</FieldLegend>
        <div className="grid gap-3 sm:grid-cols-2">
          {INCLUSIONS.map((inclusion) => (
            <Label key={inclusion.value} className="flex items-center gap-2 font-normal">
              <Checkbox name={`inclusion:${inclusion.value}`} />
              {inclusion.label}
            </Label>
          ))}
        </div>
      </FieldSet>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="Anything a buyer should know: history, marks, why you are selling."
        />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" name="publish" value="true">
          Publish listing
        </Button>
        <Button type="submit" name="publish" value="false" variant="outline">
          Save as draft
        </Button>
      </div>
    </form>
  );
}
