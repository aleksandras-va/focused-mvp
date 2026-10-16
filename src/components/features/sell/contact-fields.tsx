'use client';

import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FormSection } from '@/components/features/sell/form-section';
import { Button } from '@/components/ui/button';
import { CitySelect } from '@/components/ui/city-select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { City } from '@/services/city/city.types';

interface ContactFieldsProps {
  step: number;
  email: string;
  onEmailChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  cities: City[];
  cityId: string;
  onCityChange: (cityId: string) => void;
}

export function ContactFields({
  step,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  cities,
  cityId,
  onCityChange,
}: ContactFieldsProps) {
  const t = useTranslations('sell.contact');
  const [isEditing, setIsEditing] = useState(!email && !phone);
  const cityName = cities.find((city) => city.id === cityId)?.name ?? null;

  return (
    <FormSection
      step={step}
      title={t('title')}
      action={
        isEditing ? null : (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {t('edit')}
          </Button>
        )
      }
    >
      {isEditing ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactEmail">{t('email')}</FieldLabel>
            <Input
              id="contactEmail"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactPhone">{t('phone')}</FieldLabel>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="+370…"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">{t('city')}</FieldLabel>
            <CitySelect
              id="city"
              cities={cities}
              value={cityId || null}
              onValueChange={onCityChange}
            />
          </Field>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem]">
          <span className="flex items-center gap-2">
            <MailIcon className="size-4 text-muted-foreground" />
            {email || t('noEmail')}
          </span>
          <span className="flex items-center gap-2">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {phone || t('noPhone')}
          </span>
          <span className="flex items-center gap-2">
            <MapPinIcon className="size-4 text-muted-foreground" />
            {cityName ?? t('noCity')}
          </span>
        </div>
      )}
      <p className="text-[0.8125rem] text-muted-foreground">{t('hint')}</p>
    </FormSection>
  );
}
