'use client';

import { FormSection } from '@/components/features/sell/form-section';
import { CitySelect } from '@/components/ui/city-select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { City } from '@/services/city/city.types';

interface ContactFieldsProps {
  email: string;
  onEmailChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  cities: City[];
  cityId: string;
  onCityChange: (cityId: string) => void;
}

export function ContactFields({
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  cities,
  cityId,
  onCityChange,
}: ContactFieldsProps) {
  return (
    <FormSection
      title="Contact"
      description="Prefilled from your profile — edit it for this ad only."
    >
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
    </FormSection>
  );
}
