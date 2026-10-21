import { EyeOffIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CitySelect } from '@/components/ui/city-select';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { City } from '@/services/city/city.types';

interface ProfileFieldsProps {
  idPrefix: string;
  user: { displayName: string; phone: string | null; cityId: string | null };
  cities: City[];
}

export function ProfileFields({ idPrefix, user, cities }: ProfileFieldsProps) {
  const t = useTranslations('account.prompt');

  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-name`}>{t('name')}</FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          name="displayName"
          autoComplete="name"
          placeholder={t('namePlaceholder')}
          defaultValue={user.displayName}
          required
          className="h-12 rounded-xl text-base"
        />
      </Field>

      <Field>
        <div className="flex items-baseline justify-between gap-2">
          <FieldLabel htmlFor={`${idPrefix}-phone`}>{t('phone')}</FieldLabel>
          <span className="text-xs text-muted-foreground">{t('optional')}</span>
        </div>
        <Input
          id={`${idPrefix}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+370…"
          defaultValue={user.phone ?? ''}
          className="h-12 rounded-xl text-base"
        />
        <FieldDescription className="flex items-start gap-2 text-foreground/75">
          <EyeOffIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
          {t('phoneHint')}
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-city`}>{t('city')}</FieldLabel>
        <CitySelect
          id={`${idPrefix}-city`}
          name="cityId"
          cities={cities}
          defaultValue={user.cityId}
        />
      </Field>
    </>
  );
}
