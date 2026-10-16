'use client';

import { useTranslations } from 'next-intl';
import type { SellStep } from '@/components/features/sell/use-sell-listing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SellProgressProps {
  steps: SellStep[];
}

const LEVELS = [
  { key: 'incomplete', lineClassName: 'bg-destructive' },
  { key: 'ready', lineClassName: 'bg-warning' },
  { key: 'excellent', lineClassName: 'bg-primary' },
] as const;

export function SellProgress({ steps }: SellProgressProps) {
  const t = useTranslations('sell.progress');
  const isRequiredDone = steps.every((step) => step.optional || step.done);
  const isEverythingDone = steps.every((step) => step.done);
  const filledLineCount = isEverythingDone ? 3 : isRequiredDone ? 2 : 1;
  const level = LEVELS[filledLineCount - 1];
  const message = t(level.key);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger aria-label={message} className="flex w-full cursor-default gap-1.5 py-2">
          {LEVELS.map((lineLevel, index) => (
            <span
              key={lineLevel.key}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                index < filledLineCount ? level.lineClassName : 'bg-input',
              )}
            />
          ))}
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
