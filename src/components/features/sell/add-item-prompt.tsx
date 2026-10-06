'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddItemPromptProps {
  isBundle: boolean;
  suggestLens: boolean;
  onAdd: () => void;
}

export function AddItemPrompt({ isBundle, suggestLens, onAdd }: AddItemPromptProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-input bg-muted/30 px-4 py-3.5 sm:px-5">
      {isBundle ? (
        <span className="text-sm text-foreground/80">Anything else going with it?</span>
      ) : (
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">
            {suggestLens ? 'Selling a lens with it?' : 'Selling more than one item?'}
          </span>
          <span className="text-[0.8125rem] text-muted-foreground">
            {suggestLens
              ? 'Add it as its own item — buyers searching for the lens will find your ad too.'
              : 'Add another item and this ad becomes a bundle.'}
          </span>
        </span>
      )}
      <Button type="button" variant="outline" onClick={onAdd}>
        <PlusIcon />
        Add another item
      </Button>
    </div>
  );
}
