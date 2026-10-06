import { Button } from '@/components/ui/button';
import { CitySelect } from '@/components/ui/city-select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/services/auth/auth.types';
import type { City } from '@/services/city/city.types';
import { SettingsCard } from './settings-card';

type ProfileFormProps = {
  user: AuthUser;
  cities: City[];
  action: (formData: FormData) => Promise<void>;
};

export function ProfileForm({ user, cities, action }: ProfileFormProps) {
  return (
    <SettingsCard
      title="Profile"
      description="Prefilled on every new ad. You can still change it per ad."
      className="flex-[1_1_26rem]"
    >
      <form action={action} className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="profile-name">Name</FieldLabel>
          <Input id="profile-name" name="displayName" defaultValue={user.displayName} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              placeholder="+370…"
              defaultValue={user.phone ?? ''}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-city">City</FieldLabel>
            <CitySelect
              id="profile-city"
              name="cityId"
              cities={cities}
              defaultValue={user.cityId}
            />
          </Field>
        </div>
        <Button type="submit" className="self-start">
          Save profile
        </Button>
      </form>
    </SettingsCard>
  );
}
