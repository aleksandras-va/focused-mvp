import { CheckIcon, MinusIcon } from 'lucide-react';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function IncludedList({ item }: { item: ListingItemDetail }) {
  if (item.inclusions.length === 0 && item.missingInclusions.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-[1.375rem] font-bold">What is in the box</h2>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6 gap-y-2.5">
        {item.inclusions.map((label) => (
          <li key={label} className="flex items-center gap-2.5">
            <span className="flex size-5.5 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CheckIcon className="size-3.5" strokeWidth={3} />
            </span>
            {label}
          </li>
        ))}
        {item.missingInclusions.map((label) => (
          <li key={label} className="flex items-center gap-2.5 text-muted-foreground">
            <span className="flex size-5.5 items-center justify-center rounded-full bg-muted">
              <MinusIcon className="size-3" strokeWidth={3} />
            </span>
            <span>
              <span className="sr-only">Not included: </span>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
