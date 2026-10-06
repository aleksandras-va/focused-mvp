'use client';

import { FormSection } from '@/components/features/sell/form-section';
import { Textarea } from '@/components/ui/textarea';

interface AdFieldsProps {
  step: number;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function AdFields({ step, description, onDescriptionChange }: AdFieldsProps) {
  return (
    <FormSection
      step={step}
      title="Description"
      description="Optional. History, marks, why you are selling."
    >
      <Textarea
        id="description"
        aria-label="Description"
        rows={5}
        placeholder="Anything a buyer should know: history, marks, why you are selling."
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        className="rounded-xl text-[0.9375rem]"
      />
    </FormSection>
  );
}
