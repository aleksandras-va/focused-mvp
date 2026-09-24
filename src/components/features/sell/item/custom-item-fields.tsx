'use client';

import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { ModelCategory } from '@/db/tables';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import type { CustomItem } from '@/services/listing/listing.types';

const CATEGORIES: ModelCategory[] = ['camera', 'lens', 'accessory'];

interface CustomItemFieldsProps {
  custom: CustomItem;
  onChange: (custom: CustomItem) => void;
  onBackToCatalog: () => void;
}

export function CustomItemFields({ custom, onChange, onBackToCatalog }: CustomItemFieldsProps) {
  const nameId = useId();

  return (
    <Field>
      <div className="flex items-center justify-between gap-4">
        <FieldLabel htmlFor={nameId}>What are you selling?</FieldLabel>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={onBackToCatalog}
        >
          Back to the list
        </Button>
      </div>
      <ToggleGroup
        variant="outline"
        spacing={0}
        value={custom.category ? [custom.category] : []}
        onValueChange={(value) =>
          onChange({ ...custom, category: (value[0] as ModelCategory | undefined) ?? null })
        }
      >
        {CATEGORIES.map((category) => (
          <ToggleGroupItem key={category} value={category}>
            {CATEGORY_LABELS[category]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Input
        id={nameId}
        placeholder="Brand and model, e.g. DJI RS 3 Mini"
        value={custom.name}
        onChange={(event) => onChange({ ...custom, name: event.target.value })}
      />
      <FieldDescription>
        We'll add this model to the catalog soon. Your ad goes live now.
      </FieldDescription>
    </Field>
  );
}
