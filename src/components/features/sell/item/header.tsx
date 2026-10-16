import { useTranslations } from 'next-intl';
import { RemoveItemDialog } from '@/components/features/sell/item/remove-item-dialog';

interface ItemHeaderProps {
  number: number;
  onRemove: (() => void) | null;
}

export function ItemHeader({ number, onRemove }: ItemHeaderProps) {
  const t = useTranslations('sell.item');

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.9375rem] font-bold">{t('number', { number })}</span>
      {onRemove ? <RemoveItemDialog itemNumber={number} onConfirm={onRemove} /> : null}
    </div>
  );
}
