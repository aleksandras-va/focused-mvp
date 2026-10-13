import { CommandItem } from '@/components/ui/command';
import { formatPrice } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/listing-options';
import type { CatalogModelWithAds } from '@/services/model-catalog/model-catalog.types';

interface ModelItemProps {
  model: CatalogModelWithAds;
  onSelect: (model: CatalogModelWithAds) => void;
}

export function ModelItem({ model, onSelect }: ModelItemProps) {
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
            {CATEGORY_LABELS[model.category]}
            {model.mount ? ` · ${model.mount.name}` : ''}
            {model.isFilm ? ' · Film' : ''}
          </span>
        </div>
        {model.adCount > 0 ? (
          <span className="shrink-0 text-xs font-medium text-primary">
            {model.adCount === 1 ? '1 ad' : `${model.adCount} ads`}
            {model.minPriceCents !== null ? ` · from ${formatPrice(model.minPriceCents)}` : ''}
          </span>
        ) : null}
      </div>
    </CommandItem>
  );
}
