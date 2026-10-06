'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { AUTOSAVE_DELAY_MS } from '@/components/features/sell/sell.constants';
import type { CosmeticCondition, FunctionalCondition, Inclusion } from '@/db/tables';
import type {
  CreateListingPayload,
  CustomItem,
  EditableListing,
} from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

export interface SellItem {
  id: string;
  model: CatalogModel | null;
  custom: CustomItem | null;
  price: string;
  cosmeticCondition: CosmeticCondition;
  functionalCondition: FunctionalCondition;
  shutterCount: string;
  soldSeparately: boolean;
  inclusions: Inclusion[];
}

export type DraftState = 'idle' | 'saving' | 'saved' | 'error';

type SavedDraft = { id: string; itemIds: string[]; error: null } | { error: string };

interface UseSellListingOptions {
  submitAction: (
    listingId: string | null,
    payload: CreateListingPayload,
  ) => Promise<{
    error: string;
  }>;
  saveDraftAction: (listingId: string | null, payload: CreateListingPayload) => Promise<SavedDraft>;
  defaults: { email: string; phone: string; cityId: string };
  listing: EditableListing | null;
}

function emptyItem(): SellItem {
  return {
    id: crypto.randomUUID(),
    model: null,
    custom: null,
    price: '',
    cosmeticCondition: 'good',
    functionalCondition: 'fully_working',
    shutterCount: '',
    soldSeparately: true,
    inclusions: [],
  };
}

function initialItems(listing: EditableListing | null): SellItem[] {
  if (!listing || listing.items.length === 0) return [emptyItem()];

  return listing.items;
}

export function useSellListing({
  submitAction,
  saveDraftAction,
  defaults,
  listing,
}: UseSellListingOptions) {
  const [items, setItems] = useState<SellItem[]>(() => initialItems(listing));
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

  const [draftId, setDraftId] = useState<string | null>(listing?.id ?? null);
  const [draftItemIds, setDraftItemIds] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<DraftState>('idle');

  const isBundle = items.length > 1;
  const suggestLens =
    !isBundle && items.some((item) => item.model?.category === 'camera' && item.model.mount);

  const payload: CreateListingPayload = {
    items: items.map((item) => ({
      id: item.id,
      modelId: item.model?.id ?? '',
      custom: item.custom,
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
    publish: false,
  };

  const isEditingPublished = listing !== null && listing.status !== 'draft';
  const hasContent =
    photoKeys.length > 0 ||
    items.some((item) => item.model !== null || Boolean(item.custom?.name.trim()));
  const serialized = JSON.stringify(payload);
  const savedPayload = useRef(listing ? serialized : null);
  const draftIdRef = useRef(draftId);
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  draftIdRef.current = draftId;

  useEffect(() => {
    if (isEditingPublished || !hasContent || serialized === savedPayload.current) return;

    const timer = setTimeout(() => {
      saveChain.current = saveChain.current.then(async () => {
        if (serialized === savedPayload.current) return;

        setDraftState('saving');

        const result = await saveDraftAction(draftIdRef.current, JSON.parse(serialized));

        if (result.error !== null) {
          setDraftState('error');
          return;
        }

        savedPayload.current = serialized;
        setDraftId(result.id);
        setDraftItemIds(result.itemIds);
        setDraftState('saved');
      });
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [serialized, hasContent, isEditingPublished, saveDraftAction]);

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function updateItem(id: string, patch: Partial<SellItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function submit(publish: boolean) {
    setError(null);

    startTransition(async () => {
      await saveChain.current;

      const result = await submitAction(draftIdRef.current, { ...payload, publish });

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
    photoCount: photoKeys.length,
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
    draftId,
    draftItemIds,
    draftState,
    isEditingPublished,
  };
}
