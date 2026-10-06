'use client';

import { CheckIcon, PlusIcon } from 'lucide-react';
import type { Inclusion } from '@/db/tables';
import { cn } from '@/lib/utils';

interface InclusionFieldsProps {
  options: { value: Inclusion; label: string }[];
  selected: Inclusion[];
  onToggle: (inclusion: Inclusion, checked: boolean) => void;
}

export function InclusionFields({ options, selected, onToggle }: InclusionFieldsProps) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold">What is included</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((inclusion) => {
          const checked = selected.includes(inclusion.value);

          return (
            <label
              key={inclusion.value}
              className={cn(
                'inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                checked
                  ? 'border-primary bg-primary-soft text-primary-ink'
                  : 'border-input text-foreground/80 hover:border-foreground/40',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onToggle(inclusion.value, event.target.checked)}
                className="sr-only"
              />
              {checked ? (
                <CheckIcon className="size-3.5" strokeWidth={3} />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              {inclusion.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
