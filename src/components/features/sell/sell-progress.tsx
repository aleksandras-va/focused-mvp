'use client';

import type { SellStep } from '@/components/features/sell/use-sell-listing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SellProgressProps {
  steps: SellStep[];
}

const LEVELS = [
  { message: 'Keep adding info', lineClassName: 'bg-destructive' },
  { message: 'Good to go', lineClassName: 'bg-warning' },
  {
    message: 'Excellent! Buyers have everything they need',
    lineClassName: 'bg-primary',
  },
];

export function SellProgress({ steps }: SellProgressProps) {
  const isRequiredDone = steps.every((step) => step.optional || step.done);
  const isEverythingDone = steps.every((step) => step.done);
  const filledLineCount = isEverythingDone ? 3 : isRequiredDone ? 2 : 1;
  const level = LEVELS[filledLineCount - 1];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          aria-label={level.message}
          className="flex w-full cursor-default gap-1.5 py-2"
        >
          {LEVELS.map((lineLevel, index) => (
            <span
              key={lineLevel.message}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                index < filledLineCount ? level.lineClassName : 'bg-input',
              )}
            />
          ))}
        </TooltipTrigger>
        <TooltipContent>{level.message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
