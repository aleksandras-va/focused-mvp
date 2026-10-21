import { cn } from '@/lib/utils';

interface ConditionBarsProps {
  total: number;
  filled: number;
  isSelected: boolean;
}

export function ConditionBars({ total, filled, isSelected }: ConditionBarsProps) {
  return (
    <span aria-hidden className="flex shrink-0 items-center gap-0.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional and never reorder
          key={index}
          className={cn(
            'h-1 w-1.75 rounded-full',
            index >= filled ? 'bg-border' : isSelected ? 'bg-primary' : 'bg-muted-foreground/60',
          )}
        />
      ))}
    </span>
  );
}
