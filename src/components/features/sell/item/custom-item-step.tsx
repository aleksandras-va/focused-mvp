'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { PickerHeader } from '@/components/features/sell/item/picker-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ModelCategory } from '@/db/tables';
import { cn } from '@/lib/utils';
import type { CustomItem } from '@/services/listing/listing.types';

const CATEGORIES: ModelCategory[] = ['camera', 'lens', 'accessory'];

interface CustomItemStepProps {
  initial: CustomItem;
  onBack: () => void;
  onContinue: (custom: CustomItem) => void;
}

export function CustomItemStep({ initial, onBack, onContinue }: CustomItemStepProps) {
  const t = useTranslations('sell.custom');
  const tEnums = useTranslations('enums');
  const nameId = useId();
  const [category, setCategory] = useState<ModelCategory>(initial.category ?? 'camera');
  const [name, setName] = useState(initial.name);
  const trimmed = name.trim();

  return (
    <div className="flex h-full flex-col">
      <PickerHeader title={t('label')} onBack={onBack} backLabel={t('back')} />

      <form
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pt-3 pb-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onContinue({ name: trimmed, category });
        }}
      >
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-sm font-semibold">{t('category')}</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={category === option}
                onClick={() => setCategory(option)}
                className={cn(
                  'flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  category === option
                    ? 'border-primary bg-primary-soft text-primary-ink'
                    : 'border-input bg-background',
                )}
              >
                {tEnums(`category.${option}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className="text-sm font-semibold">
            {t('name')}
          </label>
          <Input
            id={nameId}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={t('placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 rounded-full border-0 px-4 text-base ring-2 ring-primary focus-visible:ring-2 focus-visible:ring-primary"
          />
          {category === 'accessory' ? null : (
            <p className="text-sm text-muted-foreground">{t('hint')}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer self-start text-sm text-foreground/75 underline underline-offset-4"
        >
          {t('back')}
        </button>

        <Button type="submit" size="lg" className="mt-auto h-12 w-full" disabled={!trimmed}>
          {t('continue')}
        </Button>
      </form>
    </div>
  );
}
