'use client';

import { useTranslations } from 'next-intl';
import { FormSection } from '@/components/features/sell/form-section';
import { Textarea } from '@/components/ui/textarea';

interface AdFieldsProps {
  step: number;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function AdFields({ step, description, onDescriptionChange }: AdFieldsProps) {
  const t = useTranslations('sell.description');

  return (
    <FormSection step={step} title={t('title')} description={t('hint')}>
      <Textarea
        id="description"
        aria-label={t('title')}
        rows={5}
        placeholder={t('placeholder')}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="rounded-xl text-[0.9375rem]"
      />
    </FormSection>
  );
}
