'use client';

import { CheckIcon } from 'lucide-react';
import { ListingCard, type ListingCardItem } from '@/components/features/browse/listing-card';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import type { DraftState, SellItem } from '@/components/features/sell/use-sell-listing';
import { formatCount } from '@/lib/format';
import { LISTING_LABELS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';

interface SellPreviewProps {
  items: SellItem[];
  isBundle: boolean;
  bundlePrice: string;
  coverUrl: string | null;
  photoCount: number;
  description: string;
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
  photoCount,
  description,
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
    title: names.length > 0 ? names.join(' + ') : 'Your item',
    subtitle: isBundle ? `${items.length} items` : (first.model?.brand.name ?? ''),
    detail: first.shutterCount
      ? `${formatCount(Number(first.shutterCount))} shutter actuations`
      : (first.model?.mount?.name ?? ''),
    priceCents: toCents(isBundle ? bundlePrice : first.price),
    condition: LISTING_LABELS.get(first.cosmeticCondition) ?? '',
    imageUrl: coverUrl,
    isBundle,
    statusLabel: null,
    editHref: null,
  };
  const checks = [
    {
      label: isBundle ? `${items.length} items described` : 'Model',
      done: names.length === items.length,
    },
    { label: 'Condition', done: true },
    {
      label: isBundle ? 'Prices on their own' : 'Price',
      done: items.every((item) => toCents(item.price) !== null),
    },
    ...(isBundle ? [{ label: 'Bundle price', done: toCents(bundlePrice) !== null }] : []),
    { label: 'Photos', done: photoCount > 0 },
    { label: 'Description (optional)', done: description.trim() !== '' },
  ];

  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1rem)] lg:flex">
      <span className="text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase">
        Preview
      </span>
      <div className="pointer-events-none shadow-[0_12px_32px_-16px_rgb(0_0_0/0.2)]">
        <ListingCard item={card} />
      </div>

      <ul className="flex flex-col gap-2.5 py-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              'flex items-center gap-2.5 text-sm',
              check.done ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {check.done ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckIcon className="size-3" strokeWidth={3.5} />
              </span>
            ) : (
              <span className="size-5 rounded-full border-2 border-input" />
            )}
            {check.label}
          </li>
        ))}
      </ul>

      <SubmitBar isPending={isPending} isPublished={isPublished} onSubmit={onSubmit} stacked />
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
