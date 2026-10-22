'use client';

import { useTranslations } from 'next-intl';
import { ListingCard, type ListingCardItem } from '@/components/features/browse/listing-card';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { SellProgress } from '@/components/features/sell/sell-progress';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import type {
  DraftState,
  SellItem,
  SellStep,
  SellStepKey,
} from '@/components/features/sell/use-sell-listing';
import { bundleFullPriceCents } from '@/lib/bundle-price';
import { resolveListingTitle } from '@/lib/listing-title';

interface SellPreviewProps {
  items: SellItem[];
  isBundle: boolean;
  bundlePrice: string;
  steps: SellStep[];
  missingSteps: SellStepKey[];
  draftState: DraftState;
  previewHref: string | null;
  onPreview: (href: string) => void;
  isPending: boolean;
  isPublished: boolean;
  onSubmit: (publish: boolean) => void;
}

function itemName(item: SellItem) {
  return item.model?.displayName ?? item.custom?.name.trim() ?? '';
}

function toCents(value: string) {
  const euros = Number(value);

  return value.trim() !== '' && Number.isFinite(euros) ? Math.round(euros * 100) : null;
}

export function SellPreview({
  items,
  isBundle,
  bundlePrice,
  steps,
  missingSteps,
  draftState,
  previewHref,
  onPreview,
  isPending,
  isPublished,
  onSubmit,
}: SellPreviewProps) {
  const t = useTranslations('sell');
  const first = items[0];
  const title = resolveListingTitle(
    items
      .map((item) => ({
        name: itemName(item),
        category: item.model?.category ?? item.custom?.category ?? null,
      }))
      .filter((item) => item.name !== ''),
  );
  const priceCents = toCents(isBundle ? bundlePrice : first.price);
  const card: ListingCardItem = {
    href: previewHref ?? '#',
    title,
    brand: first.model?.brand.name ?? null,
    itemCount: items.length,
    place: first.model?.mount?.name ?? null,
    shutterCount: first.shutterCount ? Number(first.shutterCount) : null,
    priceCents,
    fullPriceCents: bundleFullPriceCents(
      priceCents,
      items.map((item) => toCents(item.price)),
    ),
    condition: itemName(first) ? first.cosmeticCondition : null,
    imageUrl: items.find((item) => item.photos.length > 0)?.photos[0]?.url ?? null,
    isBundle,
    bundleRole: 'none',
    bundledWith: [],
    status: 'active',
    editHref: null,
  };
  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1rem)] lg:flex">
      <span className="text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase">
        {t('preview')}
      </span>
      <div className="pointer-events-none shadow-[0_12px_32px_-16px_rgb(0_0_0/0.2)] rounded-2xl">
        <ListingCard item={card} />
      </div>

      <SellProgress steps={steps} />

      <SubmitBar
        isPending={isPending}
        isPublished={isPublished}
        missingSteps={missingSteps}
        previewHref={previewHref}
        onPreview={onPreview}
        onSubmit={onSubmit}
        stacked
      />
      {isPublished ? (
        <p className="text-center text-sm text-muted-foreground">{t('changesGoLive')}</p>
      ) : (
        <div className="flex justify-center">
          <DraftBar state={draftState} />
        </div>
      )}
    </aside>
  );
}
