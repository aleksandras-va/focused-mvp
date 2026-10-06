import { formatCount } from '@/lib/format';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function FactTiles({ item }: { item: ListingItemDetail }) {
  const facts = [
    { label: 'Cosmetic', value: item.cosmeticCondition },
    { label: 'Function', value: item.functionalCondition },
    ...(item.shutterCount !== null
      ? [{ label: 'Shutter count', value: formatCount(item.shutterCount) }]
      : []),
  ];

  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col gap-0.5 rounded-xl bg-muted/70 px-3.5 py-3">
          <dt className="text-xs text-muted-foreground">{fact.label}</dt>
          <dd className="font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
