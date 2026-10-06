import Link from 'next/link';
import { SoldSeparatelyLip } from '@/components/features/listings/info/sold-separately-lip';
import { formatCount, formatOptionalPrice } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function BundleItemCard({ item }: { item: ListingItemDetail }) {
  const facts = [
    { label: 'Cosmetic', value: item.cosmeticCondition },
    { label: 'Function', value: item.functionalCondition },
    ...(item.shutterCount !== null
      ? [{ label: 'Shutter', value: formatCount(item.shutterCount) }]
      : []),
  ];

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border bg-card',
        item.soldSeparately && 'border-success/40',
      )}
    >
      {item.soldSeparately ? (
        <SoldSeparatelyLip price={formatOptionalPrice(item.priceCents)} />
      ) : null}
      <div className="flex flex-col gap-2.5 p-4 sm:px-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            {[CATEGORY_LABELS[item.category], item.mount].filter(Boolean).join(' · ')}
          </span>
          <h3 className="leading-snug font-semibold">
            <Link href={`/items/${item.id}`} className="hover:underline">
              {item.modelName}
            </Link>
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {facts.map((fact) => (
            <span
              key={fact.label}
              className="inline-flex gap-1 rounded-full bg-muted/70 px-2.5 py-0.5 text-xs"
            >
              <span className="text-muted-foreground">{fact.label}</span>
              <span className="font-semibold">{fact.value}</span>
            </span>
          ))}
        </div>
        {item.inclusions.length > 0 ? (
          <p className="text-[0.8125rem] text-foreground/80">
            <span className="text-muted-foreground">Included: </span>
            {item.inclusions.join(', ')}
          </p>
        ) : null}
      </div>
    </article>
  );
}
