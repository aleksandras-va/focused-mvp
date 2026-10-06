'use client';

import { Input } from '@/components/ui/input';

interface PriceInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
}

export function PriceInput({ id, value, onChange, large }: PriceInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground">
        €
      </span>
      <Input
        id={id}
        type="number"
        min="0"
        step="1"
        inputMode="decimal"
        placeholder="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          large
            ? 'h-13 rounded-xl bg-background pl-9 text-lg font-bold'
            : 'h-12 rounded-xl pl-9 text-base font-semibold'
        }
      />
    </div>
  );
}
