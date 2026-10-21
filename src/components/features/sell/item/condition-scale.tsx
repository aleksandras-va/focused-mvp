'use client';

import { ConditionBars } from '@/components/features/sell/item/condition-bars';
import { cn } from '@/lib/utils';

export interface ConditionOption<Value extends string> {
  value: Value;
  label: string;
  hint?: string;
}

interface ConditionScaleProps<Value extends string> {
  legend: string;
  name: string;
  options: ConditionOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
}

export function ConditionScale<Value extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  disabled = false,
}: ConditionScaleProps<Value>) {
  const selectedValue = disabled ? null : value;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedHint = options[selectedIndex]?.hint;

  return (
    <fieldset disabled={disabled} className="min-w-0 disabled:opacity-50">
      <legend className="mb-2.5 text-sm font-semibold">{legend}</legend>
      <div
        className={cn(
          'relative flex flex-col gap-2 sm:flex-row-reverse sm:gap-0 sm:rounded-full sm:border sm:bg-muted/60 sm:p-0.75',
          options.length > 3 ? 'sm:max-w-175' : 'sm:max-w-130',
        )}
      >
        {selectedIndex >= 0 ? (
          <span
            aria-hidden
            className="absolute inset-y-0.75 right-0.75 hidden rounded-full bg-primary-soft shadow-[inset_0_0_0_1.5px_var(--color-primary)] transition-transform duration-300 ease-out motion-reduce:transition-none sm:block"
            style={{
              width: `calc((100% - 0.375rem) / ${options.length})`,
              transform: `translateX(-${selectedIndex * 100}%)`,
            }}
          />
        ) : null}
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;

          return (
            <label
              key={option.value}
              className={cn(
                'relative flex min-h-14 items-center gap-3.5 rounded-2xl border px-4 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                'sm:min-h-10 sm:flex-1 sm:justify-center sm:rounded-full sm:border-0 sm:px-2 sm:py-0 sm:whitespace-nowrap',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary-soft text-primary-ink sm:bg-transparent'
                  : 'border-input bg-background sm:bg-transparent sm:text-foreground/75',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  'size-5 shrink-0 rounded-full bg-background sm:hidden',
                  isSelected
                    ? 'border-6 border-primary'
                    : 'border-[1.5px] border-muted-foreground/50',
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-px sm:flex-none">
                <span
                  className={cn(
                    'text-[0.9375rem] font-semibold sm:text-sm',
                    !isSelected && 'sm:font-medium',
                  )}
                >
                  {option.label}
                </span>
                {option.hint ? (
                  <span className="text-[0.8125rem] text-muted-foreground max-sm:block sm:sr-only">
                    {option.hint}
                  </span>
                ) : null}
              </span>
              <span className="sm:hidden">
                <ConditionBars
                  total={options.length}
                  filled={options.length - index}
                  isSelected={isSelected}
                />
              </span>
            </label>
          );
        })}
      </div>
      {selectedHint ? (
        <p aria-hidden className="mt-2.5 hidden text-sm text-muted-foreground sm:block">
          {selectedHint}
        </p>
      ) : null}
    </fieldset>
  );
}
