'use client';

import { cn } from '@/lib/utils';

interface ChoiceGroupProps<Value extends string> {
  legend: string;
  name: string;
  options: { value: Value; label: string; hint?: string }[];
  value: Value;
  onChange: (value: Value) => void;
  minWidth: string;
}

export function ChoiceGroup<Value extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  minWidth,
}: ChoiceGroupProps<Value>) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-semibold">{legend}</legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex min-h-12 cursor-pointer flex-col justify-center gap-0.5 rounded-xl border px-3.5 py-2.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
              option.value === value
                ? 'border-foreground bg-muted/70 shadow-[inset_0_0_0_1px_var(--color-foreground)]'
                : 'border-input hover:border-foreground/40',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="text-sm font-semibold">{option.label}</span>
            {option.hint ? (
              <span className="text-xs text-muted-foreground">{option.hint}</span>
            ) : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
