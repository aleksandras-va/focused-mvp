'use client';

import { Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteListingDialogProps {
  disabled: boolean;
  onConfirm: () => void;
}

export function DeleteListingDialog({ disabled, onConfirm }: DeleteListingDialogProps) {
  const t = useTranslations('listing.owner.delete');

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={disabled}
        render={
          <Button variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2Icon />
            {t('button')}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('keep')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
