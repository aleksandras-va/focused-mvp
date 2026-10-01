'use client';

import { AdFields } from '@/components/features/sell/ad-fields';
import { AddItemPrompt } from '@/components/features/sell/add-item-prompt';
import { ContactFields } from '@/components/features/sell/contact-fields';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { FormSection } from '@/components/features/sell/form-section';
import { ItemFields } from '@/components/features/sell/item';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
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
  const previewHref = sell.draftId
    ? sell.draftItemIds.length === 1
      ? `/items/${sell.draftItemIds[0]}`
      : `/bundles/${sell.draftId}`
    : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold">
          {sell.isEditingPublished ? 'Edit ad' : 'Sell gear'}
        </h1>
        <p className="text-muted-foreground">
          Pick the model, answer what buyers ask, and you are done.
        </p>
      </div>

      {sell.error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {sell.error}
        </p>
      ) : null}

      <FormSection title="Photos" description="The first photo is the cover.">
        <PhotoUploader
          uploadAction={uploadAction}
          onChange={sell.setPhotoKeys}
          initialPhotos={listing?.photos ?? []}
        />
      </FormSection>

      {sell.items.map((item, index) => (
        <ItemFields
          key={item.id}
          item={item}
          index={index}
          isBundle={sell.isBundle}
          searchAction={searchAction}
          onChange={(patch) => sell.updateItem(item.id, patch)}
          onRemove={sell.isBundle ? () => sell.removeItem(item.id) : null}
        />
      ))}

      <AddItemPrompt isBundle={sell.isBundle} suggestLens={sell.suggestLens} onAdd={sell.addItem} />

      <AdFields
        isBundle={sell.isBundle}
        bundlePrice={sell.bundlePrice}
        onBundlePriceChange={sell.setBundlePrice}
        description={sell.description}
        onDescriptionChange={sell.setDescription}
      />

      <ContactFields
        email={sell.contactEmail}
        onEmailChange={sell.setContactEmail}
        phone={sell.contactPhone}
        onPhoneChange={sell.setContactPhone}
        cities={cities}
        cityId={sell.cityId}
        onCityChange={sell.setCityId}
      />

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/90 p-3 pl-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl mx-2.5">
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
