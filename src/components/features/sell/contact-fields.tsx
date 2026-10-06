'use client';

import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(!email && !phone);
  const cityName = cities.find((city) => city.id === cityId)?.name ?? null;

  return (
    <FormSection
      step={step}
      title="Contact"
      action={
        isEditing ? null : (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )
      }
    >
      {isEditing ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="contactEmail">Email</FieldLabel>
            <Input
              id="contactEmail"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="contactPhone">Phone</FieldLabel>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="+370…"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
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
            {email || 'No email'}
          </span>
          <span className="flex items-center gap-2">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {phone || 'No phone'}
          </span>
          <span className="flex items-center gap-2">
            <MapPinIcon className="size-4 text-muted-foreground" />
            {cityName ?? 'No city'}
          </span>
        </div>
      )}
      <p className="text-[0.8125rem] text-muted-foreground">
        Prefilled from your profile. Changes here apply to this ad only.
      </p>
    </FormSection>
  );
}
