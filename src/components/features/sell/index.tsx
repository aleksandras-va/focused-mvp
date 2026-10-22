'use client';

import { useTranslations } from 'next-intl';
import { AddItemPrompt } from '@/components/features/sell/add-item-prompt';
import { BundlePriceField } from '@/components/features/sell/bundle-price-field';
import { CompletionHint } from '@/components/features/sell/completion-hint';
import { ContactFields } from '@/components/features/sell/contact-fields';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { FormSection } from '@/components/features/sell/form-section';
import { ItemFields } from '@/components/features/sell/item';
import { ItemSummaryRow } from '@/components/features/sell/item/summary-row';
import { SellPreview } from '@/components/features/sell/sell-preview';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import { useOpenItem } from '@/components/features/sell/use-open-item';
import { useSellListing } from '@/components/features/sell/use-sell-listing';
import type { City } from '@/services/city/city.types';
import type { CreateListingPayload, EditableListing } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';
import type { PhotoUpload } from '@/services/photo/photo.types';

type SavedDraft = { id: string; itemIds: string[]; error: null } | { error: string };

interface SellListingProps {
  submitAction: (
    listingId: string | null,
    payload: CreateListingPayload,
  ) => Promise<{ error: string }>;
  saveDraftAction: (listingId: string | null, payload: CreateListingPayload) => Promise<SavedDraft>;
  searchAction: (term: string, preferredMountSlugs: string[]) => Promise<CatalogModel[]>;
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
  cities: City[];
  defaults: { email: string; phone: string; cityId: string };
  listing: EditableListing | null;
}

export function SellListing({
  submitAction,
  saveDraftAction,
  searchAction,
  uploadAction,
  cities,
  defaults,
  listing,
}: SellListingProps) {
  const t = useTranslations('sell');
  const tListing = useTranslations('listing');
  const sell = useSellListing({ submitAction, saveDraftAction, defaults, listing });
  const openItem = useOpenItem(sell.items);
  const previewHref = sell.draftId
    ? sell.draftItemIds.length === 1
      ? `/items/${sell.draftItemIds[0]}`
      : `/bundles/${sell.draftId}`
    : null;

  const addItem = () => {
    openItem.openLastItem();
    sell.addItem();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">
          {sell.isEditingPublished ? t('editTitle') : t('title')}
        </h1>
        <p className="text-muted-foreground sm:text-lg">{t('subtitle')}</p>
      </div>

      {sell.error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {sell.error}
        </p>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <FormSection
            step={1}
            title={t('whatSelling')}
            action={
              sell.isBundle ? (
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-ink">
                  {tListing('bundleBadge', { count: sell.items.length })}
                </span>
              ) : null
            }
          >
            {sell.items.map((item, index) => (
              <div
                key={item.id}
                ref={item.id === openItem.scrollTargetId ? openItem.scrollTargetRef : null}
                className="scroll-mt-[calc(var(--spacing-header)+1rem)]"
              >
                {sell.isBundle && item.id !== openItem.activeItemId ? (
                  <ItemSummaryRow
                    item={item}
                    index={index}
                    onEdit={() => openItem.openItem(item.id)}
                  />
                ) : (
                  <ItemFields
                    item={item}
                    index={index}
                    isBundle={sell.isBundle}
                    siblingModels={sell.items.flatMap((sibling) =>
                      sibling.id !== item.id && sibling.model ? [sibling.model] : [],
                    )}
                    searchAction={searchAction}
                    uploadAction={uploadAction}
                    onChange={(patch) => sell.updateItem(item.id, patch)}
                    onRemove={sell.isBundle ? () => sell.removeItem(item.id) : null}
                  />
                )}
              </div>
            ))}

            <AddItemPrompt
              isBundle={sell.isBundle}
              suggestLens={sell.suggestLens}
              onAdd={addItem}
            />

            {sell.isBundle ? (
              <BundlePriceField
                items={sell.items}
                value={sell.bundlePrice}
                onChange={sell.setBundlePrice}
              />
            ) : null}
          </FormSection>

          <ContactFields
            step={2}
            email={sell.contactEmail}
            onEmailChange={sell.setContactEmail}
            phone={sell.contactPhone}
            onPhoneChange={sell.setContactPhone}
            cities={cities}
            cityId={sell.cityId}
            onCityChange={sell.setCityId}
          />
        </div>

        <SellPreview
          items={sell.items}
          isBundle={sell.isBundle}
          bundlePrice={sell.bundlePrice}
          steps={sell.steps}
          missingSteps={sell.missingSteps}
          draftState={sell.draftState}
          previewHref={previewHref}
          onPreview={sell.openPreview}
          isPending={sell.isPending}
          isPublished={sell.isEditingPublished}
          onSubmit={sell.submit}
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 -mb-16 flex flex-col gap-3.5 bg-background/95 px-4 pt-3 pb-4 shadow-[0_-1px_0_var(--color-border),0_-8px_24px_-12px_rgb(0_0_0/0.2)] backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
        <SubmitBar
          isPending={sell.isPending}
          isPublished={sell.isEditingPublished}
          missingSteps={sell.missingSteps}
          previewHref={previewHref}
          onPreview={sell.openPreview}
          onSubmit={sell.submit}
        />
        {sell.isEditingPublished ? (
          <p className="text-center text-sm text-muted-foreground">{t('changesGoLive')}</p>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center">
            <DraftBar state={sell.draftState} className="justify-center" />
            <p className="text-xs text-muted-foreground">
              <CompletionHint steps={sell.steps} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
