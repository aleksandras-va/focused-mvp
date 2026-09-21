'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { FieldLegend, FieldSet } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import type { Inclusion } from '@/db/tables';

interface InclusionFieldsProps {
  options: { value: Inclusion; label: string }[];
  selected: Inclusion[];
  onToggle: (inclusion: Inclusion, checked: boolean) => void;
}

export function InclusionFields({ options, selected, onToggle }: InclusionFieldsProps) {
  return (
    <FieldSet>
      <FieldLegend>What is included</FieldLegend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((inclusion) => (
          <Label key={inclusion.value} className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={selected.includes(inclusion.value)}
              onCheckedChange={(checked) => onToggle(inclusion.value, checked === true)}
            />
            {inclusion.label}
          </Label>
        ))}
      </div>
    </FieldSet>
  );
}
