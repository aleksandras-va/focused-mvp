import { CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/services/auth/auth.types';
import { SettingsCard } from './settings-card';

type StoreSectionProps = {
  store: AuthUser['store'];
  action: (formData: FormData) => Promise<void>;
};

export function StoreSection({ store, action }: StoreSectionProps) {
  const options = [
    { label: 'Private person', hint: 'Your name on your ads.', selected: !store },
    {
      label: 'Store',
      hint: 'A storefront and a store badge on your ads.',
      selected: Boolean(store),
    },
  ];

  return (
    <SettingsCard title="Selling as" description="How buyers see you." className="flex-[1_1_22rem]">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div
            key={option.label}
            className={cn(
              'flex flex-col gap-1 rounded-2xl border p-3.5',
              option.selected
                ? 'border-foreground bg-muted/70 shadow-[inset_0_0_0_1px_var(--color-foreground)]'
                : 'border-input',
            )}
          >
            <span className="flex items-center justify-between gap-2 font-semibold">
              {option.label}
              {option.selected ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <CheckIcon className="size-3" strokeWidth={3.5} />
                </span>
              ) : null}
            </span>
            <span className="text-xs text-muted-foreground">{option.hint}</span>
          </div>
        ))}
      </div>

      {store ? (
        <div className="flex items-center gap-2">
          <span className="font-medium">{store.name}</span>
          <Badge variant="secondary">Store</Badge>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="store-name">Store name</FieldLabel>
            <Input id="store-name" name="storeName" required />
            <FieldDescription>Shown on your ads and storefront.</FieldDescription>
          </Field>
          <Button type="submit" variant="outline" className="self-start border-input">
            Open a store
          </Button>
        </form>
      )}
    </SettingsCard>
  );
}
