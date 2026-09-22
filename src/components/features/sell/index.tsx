'use client';

import { AdFields } from '@/components/features/sell/ad-fields';
import { AddItemPrompt } from '@/components/features/sell/add-item-prompt';
import { ContactFields } from '@/components/features/sell/contact-fields';
import { DraftBar } from '@/components/features/sell/draft-bar';
import { ItemFields } from '@/components/features/sell/item';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import { useSellListing } from '@/components/features/sell/use-sell-listing';
import { FieldLegend, FieldSet } from '@/components/ui/field';
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
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {sell.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sell.error}
        </p>
      ) : null}

      <FieldSet>
        <FieldLegend>Photos</FieldLegend>
        <PhotoUploader
          uploadAction={uploadAction}
          onChange={sell.setPhotoKeys}
          initialPhotos={listing?.photos ?? []}
        />
      </FieldSet>

      {sell.items.map((item, index) => (
        <ItemFields
          key={item.key}
          item={item}
          index={index}
          isBundle={sell.isBundle}
          searchAction={searchAction}
          onChange={(patch) => sell.updateItem(item.key, patch)}
          onRemove={sell.isBundle ? () => sell.removeItem(item.key) : null}
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

      {sell.isEditingPublished ? null : (
        <DraftBar state={sell.draftState} previewHref={previewHref} />
      )}

      <SubmitBar
        isPending={sell.isPending}
        isPublished={sell.isEditingPublished}
        onSubmit={sell.submit}
      />
    </div>
  );
}
