'use client';

import { XIcon } from 'lucide-react';
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

interface RemoveItemDialogProps {
  itemTitle: string;
  onConfirm: () => void;
}

export function RemoveItemDialog({ itemTitle, onConfirm }: RemoveItemDialogProps) {
  const itemLabel = itemTitle.toLowerCase();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${itemLabel}`}>
            <XIcon />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {itemLabel} from the bundle?</AlertDialogTitle>
          <AlertDialogDescription>
            Everything you filled in for this item is discarded. The other items stay as they are.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
