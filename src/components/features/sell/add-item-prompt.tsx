'use client';

import { PlusIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AddItemPromptProps {
  isBundle: boolean;
  suggestLens: boolean;
  onAdd: () => void;
}

export function AddItemPrompt({ isBundle, suggestLens, onAdd }: AddItemPromptProps) {
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="neutral" className="flex justify-between items-center">
        <div>
          <AlertTitle>
            {suggestLens ? 'Selling a lens with it?' : 'Selling more than one item?'}
          </AlertTitle>
          <AlertDescription>
            {suggestLens
              ? 'Add it as its own item — buyers searching for the lens will find your ad too.'
              : 'Add another item and this ad becomes a bundle.'}
          </AlertDescription>
        </div>
        <Button type="button" variant="outline" size="lg" onClick={onAdd}>
          <PlusIcon />
          Add another item
        </Button>
      </Alert>
      {isBundle ? (
        <Alert variant="neutral">
          <AlertDescription>
            This ad will be listed as a bundle. Set a price for the whole bundle and one per item —
            if the bundle costs less than the items combined, the ad gets a discount label.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
