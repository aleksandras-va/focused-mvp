'use client';

import { CompletionHint } from '@/components/features/sell/completion-hint';
import type { SellStep } from '@/components/features/sell/use-sell-listing';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SellProgressProps {
  steps: SellStep[];
}

const LINE_CLASS_NAMES = ['bg-destructive', 'bg-warning', 'bg-primary'] as const;

export function SellProgress({ steps }: SellProgressProps) {
  const isRequiredDone = steps.every((step) => step.optional || step.done);
  const isEverythingDone = steps.every((step) => step.done);
  const filledLineCount = isEverythingDone ? 3 : isRequiredDone ? 2 : 1;
  const lineClassName = LINE_CLASS_NAMES[filledLineCount - 1];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex w-full cursor-default gap-1.5 py-2">
          {LINE_CLASS_NAMES.map((line, index) => (
            <span
              key={line}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all',
                index < filledLineCount ? lineClassName : 'bg-input',
              )}
            />
          ))}
          <span className="sr-only">
            <CompletionHint steps={steps} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <CompletionHint steps={steps} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
