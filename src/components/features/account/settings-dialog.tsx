'use client';

import { SettingsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ProfileDialogContent } from '@/components/features/account/profile-dialog-content';
import { ProfileFields } from '@/components/features/account/profile-fields';
import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { City } from '@/services/city/city.types';

interface SettingsDialogProps {
  user: { displayName: string; phone: string | null; cityId: string | null };
  cities: City[];
  action: (formData: FormData) => Promise<void>;
  signOutAction: () => Promise<void>;
}

export function SettingsDialog({ user, cities, action, signOutAction }: SettingsDialogProps) {
  const t = useTranslations('account');
  const [open, setOpen] = useState(false);

  const save = (formData: FormData) => {
    setOpen(false);
    return action(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="border-input"
            aria-label={t('settings')}
          />
        }
      >
        <SettingsIcon />
      </DialogTrigger>
      <ProfileDialogContent>
        <form action={save} className="flex flex-col gap-5.5">
          <div className="flex flex-col gap-2.5">
            <DialogTitle className="font-heading text-[1.75rem] leading-tight font-semibold">
              {t('settings')}
            </DialogTitle>
            <DialogDescription className="text-[0.9375rem] leading-relaxed">
              {t('profile.description')}
            </DialogDescription>
          </div>

          <ProfileFields idPrefix="settings" user={user} cities={cities} />

          <div className="flex flex-col gap-1.5 pt-1">
            <Button type="submit" size="lg">
              {t('profile.save')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              {t('profile.cancel')}
            </Button>
          </div>
        </form>
        <form action={signOutAction} className="mt-5.5 flex flex-col border-t pt-5.5">
          <Button
            type="submit"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {t('signOut')}
          </Button>
        </form>
      </ProfileDialogContent>
    </Dialog>
  );
}
