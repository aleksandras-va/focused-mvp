'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react';
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
import { modelHref } from '@/lib/model-href';
import { type RecentlyViewedListing, readRecentlyViewed } from '@/lib/recently-viewed';
import { useMediaQuery } from '@/lib/use-media-query';
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
  const tCommon = useTranslations('common');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<BrandAndModelSearchResults>({ brands: [], models: [] });
  const [searchedTerm, setSearchedTerm] = useState('');
  const [suggested, setSuggested] = useState<CatalogModelWithAds[]>([]);
  const [recent, setRecent] = useState<RecentlyViewedListing[]>([]);
  const [isSearching, startSearching] = useTransition();
  const router = useRouter();
  const openedWith = useRef<SearchOutcome['openedWith']>('click');

  const browsing = term.trim().length < 1;
  const isSettled = searchedTerm === term.trim() && !isSearching;

  const toggleWithShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;

    event.preventDefault();
    if (!open) openedWith.current = 'shortcut';
    changeOpen(!open);
  });

  useEffect(() => {
    window.addEventListener('keydown', toggleWithShortcut);
    return () => window.removeEventListener('keydown', toggleWithShortcut);
  }, []);

  useEffect(() => {
    if (!open) {
      openedWith.current = 'click';
      return;
    }

    setRecent(readRecentlyViewed());
    startSearching(async () => {
      setSuggested(await suggestionsAction());
    });
  }, [open, suggestionsAction]);

  useEffect(() => {
    if (browsing) {
      setResults({ brands: [], models: [] });
      setSearchedTerm('');
      return;
    }

    const timer = setTimeout(() => {
      startSearching(async () => {
        const found = await searchAction(term);

        setResults(found);
        setSearchedTerm(term.trim());
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
      openedWith: openedWith.current,
    });
  }

  function go(href: string, selection: SearchSelection | null = null) {
    reportSearch(selection);
    onOpenChange(false);
    setTerm('');
    router.push(href);
  }

  function goToModel(model: CatalogModelWithAds) {
    go(modelHref(model.slug), { kind: 'model', slug: model.slug });
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
      fullScreenOnMobile
    >
      <Command shouldFilter={false} className="p-2 max-sm:rounded-none! max-sm:p-0">
        <CommandInput
          placeholder={isMobile ? t('placeholderShort') : t('placeholder')}
          value={term}
          onValueChange={setTerm}
          fullScreenOnMobile
          onBack={() => changeOpen(false)}
          backLabel={tCommon('back')}
          clearLabel={tCommon('clear')}
        />
        <CommandList className="mt-2 max-sm:mt-0 max-h-[min(28rem,60vh)] max-sm:max-h-none max-sm:flex-1">
          {browsing ? (
            <>
              {recent.length > 0 ? (
                <CommandGroup className="p-2" heading={t('recentlyViewed')}>
                  {recent.map((listing) => (
                    <CommandItem
                      className="px-3 py-2.5 max-sm:min-h-14"
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
                      className="px-3 py-2.5 max-sm:min-h-14"
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
                <CommandEmpty>{isSettled ? t('nothingFound') : t('searching')}</CommandEmpty>
              ) : null}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
