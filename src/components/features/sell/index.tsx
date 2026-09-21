'use client';

import { AdFields } from '@/components/features/sell/ad-fields';
import { AddItemPrompt } from '@/components/features/sell/add-item-prompt';
import { ContactFields } from '@/components/features/sell/contact-fields';
import { ItemFields } from '@/components/features/sell/item';
import { PhotoUploader } from '@/components/features/sell/photo-uploader';
import { SubmitBar } from '@/components/features/sell/submit-bar';
import { useSellListing } from '@/components/features/sell/use-sell-listing';
import { FieldLegend, FieldSet } from '@/components/ui/field';
import type { City } from '@/services/city/city.types';
import type { CreateListingPayload } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';
import type { PhotoUpload } from '@/services/photo/photo.types';

interface SellListingProps {
  createAction: (payload: CreateListingPayload) => Promise<{ error: string }>;
  searchAction: (term: string) => Promise<CatalogModel[]>;
  uploadAction: () => Promise<PhotoUpload | { error: string }>;
  cities: City[];
  defaults: { email: string; phone: string; cityId: string };
}

export function SellListing({
  createAction,
  searchAction,
  uploadAction,
  cities,
  defaults,
}: SellListingProps) {
  const sell = useSellListing({ createAction, defaults });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      {sell.error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {sell.error}
        </p>
      ) : null}

      <FieldSet>
        <FieldLegend>Photos</FieldLegend>
        <PhotoUploader uploadAction={uploadAction} onChange={sell.setPhotoKeys} />
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

      <SubmitBar isPending={sell.isPending} onSubmit={sell.submit} />
    </div>
  );
}
