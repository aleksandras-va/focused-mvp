import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SoldSeparatelyLip } from '@/components/features/listings/info/sold-separately-lip';
import { formatCount, formatOptionalPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ListingItemDetail } from '@/services/listing/listing.types';

export function BundleItemCard({ item }: { item: ListingItemDetail }) {
  const t = useTranslations('listing');
  const tEnums = useTranslations('enums');
  const cover = item.photos[0] ?? null;
  const facts = [
    {
      label: t('facts.cosmetic'),
      value: tEnums(`cosmeticCondition.${item.cosmeticCondition}`),
    },
    {
      label: t('facts.functional'),
      value: tEnums(`functionalCondition.${item.functionalCondition}`),
    },
    ...(item.shutterCount !== null
      ? [{ label: t('facts.shutter'), value: formatCount(item.shutterCount) }]
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
        <SoldSeparatelyLip price={formatOptionalPrice(item.priceCents, t('noPrice'))} />
      ) : null}
      <div className="flex gap-4 p-4 sm:px-5">
        <Link
          href={`/items/${item.id}`}
          tabIndex={-1}
          aria-hidden
          className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24"
        >
          {cover ? (
            // biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer
            <img
              src={cover.cardUrl}
              alt={item.modelName}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <ImageIcon className="size-6 text-muted-foreground/50" />
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              {[tEnums(`category.${item.category}`), item.mount].filter(Boolean).join(' · ')}
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
          {item.description ? (
            <p className="line-clamp-3 text-[0.8125rem] leading-relaxed whitespace-pre-line text-foreground/80">
              {item.description}
            </p>
          ) : null}
          {item.inclusions.length > 0 ? (
            <p className="text-[0.8125rem] text-foreground/80">
              <span className="text-muted-foreground">{t('included')} </span>
              {item.inclusions.map((inclusion) => tEnums(`inclusion.${inclusion}`)).join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
