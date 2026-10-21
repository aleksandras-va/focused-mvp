import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import type { CatalogModelWithOffers } from '@/services/model-catalog/model-catalog.types';

export function ModelHeader({ model }: { model: CatalogModelWithOffers }) {
  const t = useTranslations('modelPage');
  const tEnums = useTranslations('enums');
  const { adCount, minPriceCents, maxPriceCents } = model.offers;
  const priceRange =
    minPriceCents === null || maxPriceCents === null
      ? null
      : minPriceCents === maxPriceCents
        ? formatPrice(minPriceCents)
        : t('priceRange', { min: formatPrice(minPriceCents), max: formatPrice(maxPriceCents) });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">
          {model.brand.name} · {tEnums(`category.${model.category}`)}
        </p>
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">{model.displayName}</h1>
        {adCount > 0 ? (
          <p className="text-lg">
            {priceRange ? <span className="font-semibold">{priceRange} · </span> : null}
            <span className="text-muted-foreground">{t('adCount', { count: adCount })}</span>
          </p>
        ) : null}
      </div>
      <Link href="/sell" className={buttonVariants({ variant: 'outline' })}>
        {t('sellYours', { name: model.displayName })}
      </Link>
    </div>
  );
}
