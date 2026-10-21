'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { ProfileDialogContent } from '@/components/features/account/profile-dialog-content';
import { ProfileFields } from '@/components/features/account/profile-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle } from '@/components/ui/dialog';
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
      <ProfileDialogContent>
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

          <ProfileFields idPrefix="prompt" user={user} cities={cities} />

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
      </ProfileDialogContent>
    </Dialog>
  );
}
