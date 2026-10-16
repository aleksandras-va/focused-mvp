import { useTranslations } from 'next-intl';
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
  const t = useTranslations('account.profile');

  return (
    <SettingsCard title={t('title')} description={t('description')} className="flex-[1_1_26rem]">
      <form
        key={`${user.displayName}|${user.phone}|${user.cityId}`}
        action={action}
        className="flex flex-col gap-5"
      >
        <Field>
          <FieldLabel htmlFor="profile-name">{t('name')}</FieldLabel>
          <Input id="profile-name" name="displayName" defaultValue={user.displayName} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="profile-phone">{t('phone')}</FieldLabel>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              placeholder="+370…"
              defaultValue={user.phone ?? ''}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-city">{t('city')}</FieldLabel>
            <CitySelect
              id="profile-city"
              name="cityId"
              cities={cities}
              defaultValue={user.cityId}
            />
          </Field>
        </div>
        <Button type="submit" className="self-start">
          {t('save')}
        </Button>
      </form>
    </SettingsCard>
  );
}
