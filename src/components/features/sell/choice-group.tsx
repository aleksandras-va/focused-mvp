'use client';

import { type Choice, ChoiceOption } from '@/components/features/sell/choice-option';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ChoiceGroupProps<Value extends string> {
  legend: string;
  name: string;
  options: Choice<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
}

export function ChoiceGroup<Value extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  disabled = false,
}: ChoiceGroupProps<Value>) {
  const selectedValue = disabled ? null : value;

  return (
    <TooltipProvider>
      <fieldset disabled={disabled} className="flex flex-col gap-2.5 disabled:opacity-50">
        <legend className="mb-2.5 text-sm font-semibold">{legend}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <ChoiceOption
              key={option.value}
              choice={option}
              name={name}
              isSelected={option.value === selectedValue}
              disabled={disabled}
              onSelect={onChange}
            />
          ))}
        </div>
      </fieldset>
    </TooltipProvider>
  );
}
