import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/services/auth/auth.types';

type StoreSectionProps = {
  store: AuthUser['store'];
  action: (formData: FormData) => Promise<void>;
};

export function StoreSection({ store, action }: StoreSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selling as</CardTitle>
      </CardHeader>
      <CardContent>
        {store ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">{store.name}</span>
            <Badge variant="secondary">Store</Badge>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              You sell as a private person. Shops can open a store to get a storefront and a store
              badge on their ads.
            </p>
            <Field>
              <FieldLabel htmlFor="store-name">Store name</FieldLabel>
              <Input id="store-name" name="storeName" required />
              <FieldDescription>Shown on your ads and storefront.</FieldDescription>
            </Field>
            <Button type="submit" variant="outline" className="self-start">
              Open a store
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
