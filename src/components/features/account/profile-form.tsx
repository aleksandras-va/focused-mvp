import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/services/auth/auth.types';

type ProfileFormProps = {
  user: AuthUser;
  action: (formData: FormData) => Promise<void>;
};

export function ProfileForm({ user, action }: ProfileFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="profile-name">Name</FieldLabel>
            <Input id="profile-name" name="displayName" defaultValue={user.displayName} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              placeholder="+370…"
              defaultValue={user.phone ?? ''}
            />
            <FieldDescription>Prefilled as the contact phone on new ads.</FieldDescription>
          </Field>
          <Button type="submit" className="self-start">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
