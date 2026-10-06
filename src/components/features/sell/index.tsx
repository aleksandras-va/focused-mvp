'use client';

import { useState } from 'react';
import { AdFields } from '@/components/features/sell/ad-fields';
import { AddItemPrompt } from '@/components/features/sell/add-item-prompt';
import { BundlePriceField } from '@/components/features/sell/bundle-price-field';
import { ContactFields } from '@/components/features/sell/contact-fields';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { FormSection } from '@/components/features/sell/form-section';
import { ItemFields } from '@/components/features/sell/item';
import { ItemSummaryRow } from '@/components/features/sell/item/summary-row';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
import { SellPreview } from '@/components/features/sell/sell-preview';
import { SubmitBar } from '@/components/features/sell/submit-bar';
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
  searchAction: (term: string) => Promise<CatalogModel[]>;
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
  const sell = useSellListing({ submitAction, saveDraftAction, defaults, listing });
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const previewHref = sell.draftId
    ? sell.draftItemIds.length === 1
      ? `/items/${sell.draftItemIds[0]}`
      : `/bundles/${sell.draftId}`
    : null;
  const lastItemId = sell.items[sell.items.length - 1]?.id ?? null;
  const activeItemId =
    openItemId && sell.items.some((item) => item.id === openItemId) ? openItemId : lastItemId;

  const addItem = () => {
    setOpenItemId(null);
    sell.addItem();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-3xl leading-tight font-extrabold sm:text-4xl">
          {sell.isEditingPublished ? 'Edit ad' : 'Sell gear'}
        </h1>
        <p className="text-muted-foreground sm:text-lg">
          Pick the model, answer what buyers ask, and you are done.
        </p>
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
            title="What are you selling?"
            action={
              sell.isBundle ? (
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-ink">
                  Bundle · {sell.items.length} items
                </span>
              ) : null
            }
          >
            {sell.items.map((item, index) =>
              sell.isBundle && item.id !== activeItemId ? (
                <ItemSummaryRow
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={() => setOpenItemId(item.id)}
                />
              ) : (
                <ItemFields
                  key={item.id}
                  item={item}
                  index={index}
                  isBundle={sell.isBundle}
                  searchAction={searchAction}
                  onChange={(patch) => sell.updateItem(item.id, patch)}
                  onRemove={sell.isBundle ? () => sell.removeItem(item.id) : null}
                />
              ),
            )}

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

          <FormSection step={2} title="Photos" description="The first photo is the cover.">
            <PhotoUploader
              uploadAction={uploadAction}
              onChange={sell.setPhotoKeys}
              onCoverChange={setCoverUrl}
              initialPhotos={listing?.photos ?? []}
            />
          </FormSection>

          <AdFields
            step={3}
            description={sell.description}
            onDescriptionChange={sell.setDescription}
          />

          <ContactFields
            step={4}
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
          coverUrl={coverUrl}
          photoCount={sell.photoCount}
          description={sell.description}
          draftState={sell.draftState}
          previewHref={previewHref}
          isPending={sell.isPending}
          isPublished={sell.isEditingPublished}
          onSubmit={sell.submit}
        />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-2 bg-background/95 px-4 py-3 shadow-[0_-1px_0_var(--color-border),0_-8px_24px_-12px_rgb(0_0_0/0.2)] backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
        {sell.isEditingPublished ? (
          <p className="text-sm text-muted-foreground">Changes go live when you save.</p>
        ) : (
          <DraftBar state={sell.draftState} previewHref={previewHref} />
        )}
        <SubmitBar
          isPending={sell.isPending}
          isPublished={sell.isEditingPublished}
          onSubmit={sell.submit}
        />
      </div>
    </div>
  );
}
