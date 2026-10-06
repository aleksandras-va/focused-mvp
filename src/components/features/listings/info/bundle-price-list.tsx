import { formatOptionalPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function BundlePriceList({ items }: { items: ListingItemDetail[] }) {
  return (
    <ul className="flex flex-col border-t">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 border-b py-3 text-sm">
          <span className="truncate">{item.modelName}</span>
          <span
            className={cn(
              'shrink-0',
              item.soldSeparately ? 'font-semibold text-success' : 'text-muted-foreground',
            )}
          >
            {item.soldSeparately
              ? `${formatOptionalPrice(item.priceCents)} on its own`
              : 'Bundle only'}
          </span>
        </li>
      ))}
    </ul>
  );
}
