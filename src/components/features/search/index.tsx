'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { ModelItem } from '@/components/features/search/model-item';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { formatPrice } from '@/lib/format';
import { type RecentlyViewedListing, readRecentlyViewed } from '@/lib/recently-viewed';
import type { SearchOutcome } from '@/services/analytics/analytics.types';
import type {
  BrandAndModelSearchResults,
  CatalogModelWithAds,
} from '@/services/model-catalog/model-catalog.types';

type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchAction: (term: string) => Promise<BrandAndModelSearchResults>;
  suggestionsAction: () => Promise<CatalogModelWithAds[]>;
  trackSearchAction: (search: SearchOutcome) => Promise<void>;
};

type SearchSelection = { kind: 'brand' | 'model'; slug: string };

export function SearchDialog({
  open,
  onOpenChange,
  searchAction,
  suggestionsAction,
  trackSearchAction,
}: SearchDialogProps) {
  const t = useTranslations('search');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<BrandAndModelSearchResults>({ brands: [], models: [] });
  const [suggested, setSuggested] = useState<CatalogModelWithAds[]>([]);
  const [recent, setRecent] = useState<RecentlyViewedListing[]>([]);
  const [isSearching, startSearching] = useTransition();
  const router = useRouter();

  const browsing = term.trim().length < 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    setRecent(readRecentlyViewed());
    startSearching(async () => {
      setSuggested(await suggestionsAction());
    });
  }, [open, suggestionsAction]);

  useEffect(() => {
    if (browsing) {
      setResults({ brands: [], models: [] });
      return;
    }

    const timer = setTimeout(() => {
      startSearching(async () => {
        setResults(await searchAction(term));
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [term, browsing, searchAction]);

  function reportSearch(selection: SearchSelection | null) {
    if (browsing) return;

    trackSearchAction({
      term: term.trim(),
      resultCount: results.brands.length + results.models.length,
      selectedKind: selection?.kind ?? null,
      selectedSlug: selection?.slug ?? null,
    });
  }

  function go(href: string, selection: SearchSelection | null = null) {
    reportSearch(selection);
    onOpenChange(false);
    setTerm('');
    router.push(href);
  }

  function goToModel(model: CatalogModelWithAds) {
    go(`/?model=${model.slug}`, { kind: 'model', slug: model.slug });
  }

  function changeOpen(next: boolean) {
    if (!next) reportSearch(null);

    onOpenChange(next);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={changeOpen}
      title={t('title')}
      description={t('description')}
      className="top-24 sm:max-w-2xl"
    >
      <Command shouldFilter={false} className="p-2">
        <CommandInput placeholder={t('placeholder')} value={term} onValueChange={setTerm} />
        <CommandList className="mt-2 max-h-[min(28rem,60vh)]">
          {browsing ? (
            <>
              {recent.length > 0 ? (
                <CommandGroup className="p-2" heading={t('recentlyViewed')}>
                  {recent.map((listing) => (
                    <CommandItem
                      className="px-3 py-2.5"
                      key={listing.href}
                      value={`recent:${listing.href}`}
                      onSelect={() => go(listing.href)}
                    >
                      <div className="flex flex-1 items-center justify-between gap-4">
                        <span>{listing.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(listing.priceCents)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {suggested.length > 0 ? (
                <CommandGroup className="p-2" heading={t('suggested')}>
                  {suggested.map((model) => (
                    <ModelItem key={model.id} model={model} onSelect={goToModel} />
                  ))}
                </CommandGroup>
              ) : null}
              {recent.length === 0 && suggested.length === 0 ? (
                <CommandEmpty>{isSearching ? t('loading') : t('startTyping')}</CommandEmpty>
              ) : null}
            </>
          ) : (
            <>
              {results.brands.length > 0 ? (
                <CommandGroup className="p-2" heading={t('brands')}>
                  {results.brands.map((brand) => (
                    <CommandItem
                      className="px-3 py-2.5"
                      key={brand.slug}
                      value={`brand:${brand.slug}`}
                      onSelect={() =>
                        go(`/?brand=${brand.slug}`, { kind: 'brand', slug: brand.slug })
                      }
                    >
                      <div className="flex flex-1 items-center justify-between gap-4">
                        <span>{brand.name}</span>
                        <span className="text-xs text-muted-foreground">{t('brand')}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {results.models.length > 0 ? (
                <CommandGroup className="p-2" heading={t('models')}>
                  {results.models.map((model) => (
                    <ModelItem key={model.id} model={model} onSelect={goToModel} />
                  ))}
                </CommandGroup>
              ) : null}
              {results.brands.length === 0 && results.models.length === 0 ? (
                <CommandEmpty>{isSearching ? t('searching') : t('nothingFound')}</CommandEmpty>
              ) : null}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
