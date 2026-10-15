'use client';

import { ListingCard, type ListingCardItem } from '@/components/features/browse/listing-card';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { SellProgress } from '@/components/features/sell/sell-progress';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import type { DraftState, SellItem, SellStep } from '@/components/features/sell/use-sell-listing';

interface SellPreviewProps {
  items: SellItem[];
  isBundle: boolean;
  bundlePrice: string;
  coverUrl: string | null;
  steps: SellStep[];
  missingStepLabels: string[];
  draftState: DraftState;
  previewHref: string | null;
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
  coverUrl,
  steps,
  missingStepLabels,
  draftState,
  previewHref,
  isPending,
  isPublished,
  onSubmit,
}: SellPreviewProps) {
  const first = items[0];
  const names = items.map(itemName).filter(Boolean);
  const card: ListingCardItem = {
    href: previewHref ?? '#',
    title: { names, counts: [] },
    brand: first.model?.brand.name ?? null,
    itemCount: items.length,
    place: first.model?.mount?.name ?? null,
    shutterCount: first.shutterCount ? Number(first.shutterCount) : null,
    priceCents: toCents(isBundle ? bundlePrice : first.price),
    condition: itemName(first) ? first.cosmeticCondition : null,
    imageUrl: coverUrl,
    isBundle,
    status: 'active',
    editHref: null,
  };
  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1rem)] lg:flex">
      <span className="text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase">
        Preview
      </span>
      <div className="pointer-events-none shadow-[0_12px_32px_-16px_rgb(0_0_0/0.2)] rounded-2xl">
        <ListingCard item={card} />
      </div>

      <SellProgress steps={steps} />

      <SubmitBar
        isPending={isPending}
        isPublished={isPublished}
        missingStepLabels={missingStepLabels}
        onSubmit={onSubmit}
        stacked
      />
      {isPublished ? (
        <p className="text-center text-sm text-muted-foreground">Changes go live when you save.</p>
      ) : (
        <div className="flex justify-center">
          <DraftBar state={draftState} previewHref={previewHref} />
        </div>
      )}
    </aside>
  );
}
