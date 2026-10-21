'use client';

import { CheckIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Inclusion } from '@/db/tables';
import { cn } from '@/lib/utils';

interface InclusionFieldsProps {
  options: Inclusion[];
  selected: Inclusion[];
  onToggle: (inclusion: Inclusion, checked: boolean) => void;
}

export function InclusionFields({ options, selected, onToggle }: InclusionFieldsProps) {
  const t = useTranslations('sell');
  const tEnums = useTranslations('enums');

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold">{t('inclusions')}</legend>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((inclusion) => {
          const checked = selected.includes(inclusion);

          return (
            <label
              key={inclusion}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-2 rounded-[0.875rem] border px-3 py-1.5 text-sm leading-[1.125rem] font-medium transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                'sm:inline-flex sm:h-10 sm:min-h-0 sm:gap-1.5 sm:rounded-full sm:px-3.5 sm:py-0',
                checked
                  ? 'border-primary bg-primary-soft text-primary-ink'
                  : 'border-input bg-background text-foreground/75 hover:border-foreground/40',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onToggle(inclusion, event.target.checked)}
                className="sr-only"
              />
              {checked ? (
                <CheckIcon className="size-3.5 shrink-0" strokeWidth={3} />
              ) : (
                <PlusIcon className="size-3.5 shrink-0" />
              )}
              {tEnums(`inclusion.${inclusion}`)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
