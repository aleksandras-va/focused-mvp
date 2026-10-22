'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react';
import { AUTOSAVE_DELAY_MS } from '@/components/features/sell/sell.constants';
import type { CosmeticCondition, FunctionalCondition, Inclusion } from '@/db/tables';
import type {
  CreateListingPayload,
  CustomItem,
  EditableListing,
  EditablePhoto,
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
  description: string;
  photos: EditablePhoto[];
  inclusions: Inclusion[];
}

export type SellStepKey =
  | 'model'
  | 'modelEach'
  | 'condition'
  | 'price'
  | 'priceEach'
  | 'bundlePrice'
  | 'city'
  | 'photos'
  | 'photosEach'
  | 'description';

export interface SellStep {
  key: SellStepKey;
  done: boolean;
  optional?: boolean;
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
    soldSeparately: false,
    description: '',
    photos: [],
    inclusions: [],
  };
}

function isDescribed(item: SellItem) {
  return item.custom
    ? item.custom.name.trim() !== '' && item.custom.category !== null
    : item.model !== null;
}

function isPrice(value: string) {
  return value.trim() !== '' && Number.isFinite(Number(value));
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
  const [cityId, setCityId] = useState(listing?.cityId || defaults.cityId);
  const [contactEmail, setContactEmail] = useState(listing ? listing.contactEmail : defaults.email);
  const [contactPhone, setContactPhone] = useState(listing ? listing.contactPhone : defaults.phone);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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
      description: item.description || null,
      photoKeys: item.photos.map((photo) => photo.storageKey),
      inclusions: item.inclusions,
    })),
    bundlePrice: isBundle ? bundlePrice : null,
    cityId,
    contactEmail: contactEmail || null,
    contactPhone: contactPhone || null,
    publish: false,
  };

  const isEveryItemDescribed = items.every(isDescribed);
  const steps: SellStep[] = [
    { key: isBundle ? 'modelEach' : 'model', done: isEveryItemDescribed },
    { key: 'condition', done: isEveryItemDescribed },
    { key: isBundle ? 'priceEach' : 'price', done: items.every((item) => isPrice(item.price)) },
    ...(isBundle ? [{ key: 'bundlePrice' as const, done: isPrice(bundlePrice) }] : []),
    { key: 'city', done: cityId !== '' },
    {
      key: isBundle ? 'photosEach' : 'photos',
      done: items.every((item) => item.photos.length > 0),
    },
    {
      key: 'description',
      done: items.every((item) => item.description.trim() !== ''),
      optional: true,
    },
  ];
  const missingSteps = steps.filter((step) => !step.optional && !step.done);

  const isEditingPublished = listing !== null && listing.status !== 'draft';
  const hasContent = items.some(isDescribed);
  const serialized = JSON.stringify(payload);
  const savedPayload = useRef(listing ? serialized : null);
  const draftIdRef = useRef(draftId);
  const saveChain = useRef<Promise<void>>(Promise.resolve());

  draftIdRef.current = draftId;

  function saveDraft(snapshot: string) {
    saveChain.current = saveChain.current.then(async () => {
      if (snapshot === savedPayload.current) return;

      setDraftState('saving');

      const result = await saveDraftAction(draftIdRef.current, JSON.parse(snapshot));

      if (result.error !== null) {
        setDraftState('error');
        return;
      }

      savedPayload.current = snapshot;
      setDraftId(result.id);
      setDraftItemIds(result.itemIds);
      setDraftState('saved');
    });

    return saveChain.current;
  }

  const saveDraftLater = useEffectEvent(() => saveDraft(serialized));

  useEffect(() => {
    if (isEditingPublished || !hasContent || serialized === savedPayload.current) return;

    const timer = setTimeout(saveDraftLater, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [serialized, hasContent, isEditingPublished]);

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function updateItem(id: string, patch: Partial<SellItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function openPreview(href: string) {
    startTransition(async () => {
      await saveDraft(serialized);
      router.push(href);
    });
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
    steps,
    missingSteps: missingSteps.map((step) => step.key),
    addItem,
    removeItem,
    updateItem,
    bundlePrice,
    setBundlePrice,
    cityId,
    setCityId,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    error,
    isPending,
    submit,
    openPreview,
    draftId,
    draftItemIds,
    draftState,
    isEditingPublished,
  };
}
