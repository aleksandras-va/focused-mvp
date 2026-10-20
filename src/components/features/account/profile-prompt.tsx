'use client';

import { EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CitySelect } from '@/components/ui/city-select';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { City } from '@/services/city/city.types';

interface ProfilePromptProps {
  user: { displayName: string; phone: string | null; cityId: string | null };
  cities: City[];
  completeAction: (
    state: { error: string | null },
    formData: FormData,
  ) => Promise<{ error: string | null }>;
  skipAction: () => Promise<void>;
}

export function ProfilePrompt({ user, cities, completeAction, skipAction }: ProfilePromptProps) {
  const t = useTranslations('account.prompt');
  const [open, setOpen] = useState(true);
  const [state, formAction, isPending] = useActionState(completeAction, { error: null });

  const skip = () => {
    setOpen(false);
    void skipAction();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : skip())}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 rounded-[1.75rem] p-6 sm:max-w-[30rem] sm:p-9 max-sm:inset-0 max-sm:max-w-none max-sm:translate-0 max-sm:content-start max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:rounded-none max-sm:pt-10 max-sm:ring-0"
      >
        <form action={formAction} className="flex flex-col gap-5.5">
          <div className="flex flex-col gap-2.5">
            <DialogTitle className="font-heading text-[1.75rem] leading-tight font-semibold">
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-[0.9375rem] leading-relaxed">
              {t('description')}
            </DialogDescription>
          </div>

          {state.error ? (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <Field>
            <FieldLabel htmlFor="prompt-name">{t('name')}</FieldLabel>
            <Input
              id="prompt-name"
              name="displayName"
              autoComplete="name"
              placeholder={t('namePlaceholder')}
              defaultValue={user.displayName}
              required
              className="h-12 rounded-xl text-base"
            />
          </Field>

          <Field>
            <div className="flex items-baseline justify-between gap-2">
              <FieldLabel htmlFor="prompt-phone">{t('phone')}</FieldLabel>
              <span className="text-xs text-muted-foreground">{t('optional')}</span>
            </div>
            <Input
              id="prompt-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+370…"
              defaultValue={user.phone ?? ''}
              className="h-12 rounded-xl text-base"
            />
            <FieldDescription className="flex items-start gap-2 text-foreground/75">
              <EyeOffIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {t('phoneHint')}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="prompt-city">{t('city')}</FieldLabel>
            <CitySelect id="prompt-city" name="cityId" cities={cities} defaultValue={user.cityId} />
          </Field>

          <div className="flex flex-col gap-1.5 pt-1">
            <Button type="submit" size="lg" disabled={isPending}>
              {t('save')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              disabled={isPending}
              onClick={skip}
            >
              {t('skip')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
