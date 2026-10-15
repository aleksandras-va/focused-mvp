import { useTranslations } from 'next-intl';
import { CommandItem } from '@/components/ui/command';
import { formatPrice } from '@/lib/format';
import type { CatalogModelWithAds } from '@/services/model-catalog/model-catalog.types';

interface ModelItemProps {
  model: CatalogModelWithAds;
  onSelect: (model: CatalogModelWithAds) => void;
}

export function ModelItem({ model, onSelect }: ModelItemProps) {
  const t = useTranslations();

  return (
    <CommandItem
      className="px-3 py-2.5"
      value={`model:${model.slug}`}
      onSelect={() => onSelect(model)}
    >
      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span>{model.displayName}</span>
          <span className="text-xs text-muted-foreground">
            {t(`enums.category.${model.category}`)}
            {model.mount ? ` · ${model.mount.name}` : ''}
            {model.isFilm ? ` · ${t('search.film')}` : ''}
          </span>
        </div>
        {model.adCount > 0 ? (
          <span className="shrink-0 text-xs font-medium text-primary">
            {t('search.adCount', { count: model.adCount })}
            {model.minPriceCents !== null
              ? ` · ${t('search.fromPrice', { price: formatPrice(model.minPriceCents) })}`
              : ''}
          </span>
        ) : null}
      </div>
    </CommandItem>
  );
}
