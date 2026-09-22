'use client';

import { useRef, useState, useTransition } from 'react';
import type { CosmeticCondition, FunctionalCondition, Inclusion } from '@/db/tables';
import type { CreateListingPayload, EditableListing } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

export interface SellItem {
  key: number;
  model: CatalogModel | null;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string;
  soldSeparately: boolean;
  inclusions: Inclusion[];
}

interface UseSellListingOptions {
  submitAction: (payload: CreateListingPayload) => Promise<{ error: string }>;
  defaults: { email: string; phone: string; cityId: string };
  listing: EditableListing | null;
}

function emptyItem(key: number): SellItem {
  return {
    key,
    model: null,
    price: '',
    cosmeticCondition: 'good',
    functionalCondition: 'fully_working',
    shutterCount: '',
    soldSeparately: true,
    inclusions: [],
  };
}

function initialItems(listing: EditableListing | null): SellItem[] {
  if (!listing || listing.items.length === 0) return [emptyItem(0)];

  return listing.items.map((item, index) => ({ key: index, ...item }));
}

export function useSellListing({ submitAction, defaults, listing }: UseSellListingOptions) {
  const [items, setItems] = useState<SellItem[]>(() => initialItems(listing));
  const nextKey = useRef(items.length);
  const [bundlePrice, setBundlePrice] = useState(listing?.bundlePrice ?? '');
  const [photoKeys, setPhotoKeys] = useState<string[]>(
    () => listing?.photos.map((photo) => photo.storageKey) ?? [],
  );
  const [cityId, setCityId] = useState(listing?.cityId || defaults.cityId);
  const [description, setDescription] = useState(listing?.description ?? '');
  const [contactEmail, setContactEmail] = useState(listing ? listing.contactEmail : defaults.email);
  const [contactPhone, setContactPhone] = useState(listing ? listing.contactPhone : defaults.phone);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isBundle = items.length > 1;
  const suggestLens =
    !isBundle && items.some((item) => item.model?.category === 'camera' && item.model.mount);

  function addItem() {
    setItems((current) => [...current, emptyItem(nextKey.current++)]);
  }

  function removeItem(key: number) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function updateItem(key: number, patch: Partial<SellItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function submit(publish: boolean) {
    setError(null);

    startTransition(async () => {
      const result = await submitAction({
        items: items.map((item) => ({
          modelId: item.model?.id ?? '',
          price: item.price,
          cosmeticCondition: item.cosmeticCondition,
          functionalCondition: item.functionalCondition,
          shutterCount: item.shutterCount || null,
          soldSeparately: item.soldSeparately,
          inclusions: item.inclusions,
        })),
        bundlePrice: isBundle ? bundlePrice : null,
        photoKeys,
        cityId,
        description: description || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        publish,
      });

      if (result?.error) {
        setError(result.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  return {
    items,
    isBundle,
    suggestLens,
    addItem,
    removeItem,
    updateItem,
    bundlePrice,
    setBundlePrice,
    setPhotoKeys,
    cityId,
    setCityId,
    description,
    setDescription,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    error,
    isPending,
    submit,
  };
}
