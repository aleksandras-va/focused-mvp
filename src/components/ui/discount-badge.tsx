import { useTranslations } from 'next-intl';
import { discountPercent } from '@/lib/bundle-price';
import { cn } from '@/lib/utils';

interface DiscountBadgeProps {
  priceCents: number;
  fullPriceCents: number;
  className?: string;
}

export function DiscountBadge({ priceCents, fullPriceCents, className }: DiscountBadgeProps) {
  const t = useTranslations('common');

  return (
    <span
      className={cn(
        'shrink-0 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success',
        className,
      )}
    >
      {t('discount', { percent: discountPercent(priceCents, fullPriceCents) })}
    </span>
  );
}
