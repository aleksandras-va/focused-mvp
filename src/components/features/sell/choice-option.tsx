'use client';

import type { CSSProperties } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface Choice<Value extends string> {
  value: Value;
  label: string;
  hint?: string;
  tone?: string;
}

interface ChoiceOptionProps<Value extends string> {
  choice: Choice<Value>;
  name: string;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (value: Value) => void;
}

export function ChoiceOption<Value extends string>({
  choice,
  name,
  isSelected,
  disabled,
  onSelect,
}: ChoiceOptionProps<Value>) {
  const isToned = choice.tone !== undefined;

  const style = isToned ? ({ '--tone': choice.tone } as CSSProperties) : undefined;
  const className = cn(
    'flex rounded-full border transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
    isSelected ? 'border-(--tone)/60' : isToned ? 'border-(--tone)/30' : 'border-input',
    isSelected && !isToned && 'bg-muted/70',
    isToned && (isSelected ? 'bg-(--tone)/12' : 'bg-(--tone)/2'),
    !isSelected && !disabled && 'hover:border-foreground/40',
  );

  return (
    <Tooltip disabled={!choice.hint}>
      <TooltipTrigger render={<div style={style} className={className} />}>
        <label
          className={cn(
            'flex h-9 items-center px-4 whitespace-nowrap',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          )}
        >
          <input
            type="radio"
            name={name}
            value={choice.value}
            checked={isSelected}
            onChange={() => onSelect(choice.value)}
            className="sr-only"
          />
          <span className="text-sm font-semibold">{choice.label}</span>
          {choice.hint ? <span className="sr-only">{choice.hint}</span> : null}
        </label>
      </TooltipTrigger>
      <TooltipContent>{choice.hint}</TooltipContent>
    </Tooltip>
  );
}
