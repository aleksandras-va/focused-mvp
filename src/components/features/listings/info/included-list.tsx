import { CheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function IncludedList({ item }: { item: ListingItemDetail }) {
  const t = useTranslations('listing');
  const tEnums = useTranslations('enums');

  if (item.inclusions.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-[1.375rem] font-semibold">{t('inTheBox')}</h2>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6 gap-y-2.5">
        {item.inclusions.map((inclusion) => (
          <li key={inclusion} className="flex items-center gap-2.5">
            <span className="flex size-5.5 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CheckIcon className="size-3.5" strokeWidth={3} />
            </span>
            {tEnums(`inclusion.${inclusion}`)}
          </li>
        ))}
      </ul>
    </section>
  );
}
