import { RemoveItemDialog } from '@/components/features/sell/item/remove-item-dialog';

interface ItemHeaderProps {
  title: string;
  onRemove: (() => void) | null;
}

export function ItemHeader({ title, onRemove }: ItemHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.9375rem] font-bold">{title}</span>
      {onRemove ? <RemoveItemDialog itemTitle={title} onConfirm={onRemove} /> : null}
    </div>
  );
}
