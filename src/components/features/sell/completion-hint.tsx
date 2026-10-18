'use client';

import { useTranslations } from 'next-intl';
import type { SellStep } from '@/components/features/sell/use-sell-listing';

interface CompletionHintProps {
  steps: SellStep[];
}

export function CompletionHint({ steps }: CompletionHintProps) {
  const t = useTranslations('sell');
  const missing = steps.filter((step) => !step.optional && !step.done);
  const optional = steps.filter((step) => step.optional && !step.done);
  const listSteps = (pending: SellStep[]) =>
    pending.map((step) => t(`steps.${step.key}`)).join(', ');

  if (missing.length > 0) return t('progress.missing', { steps: listSteps(missing) });
  if (optional.length > 0) return t('progress.optional', { steps: listSteps(optional) });

  return t('progress.excellent');
}
