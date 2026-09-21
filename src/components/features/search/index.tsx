'use client';

import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
import { CATEGORY_LABELS } from '@/lib/listing-options';
import { type RecentlyViewedListing, readRecentlyViewed } from '@/lib/recently-viewed';
import type {
  BrandAndModelSearchResults,
  CatalogModel,
} from '@/services/model-catalog/model-catalog.types';

type SearchOverlayProps = {
  searchAction: (term: string) => Promise<BrandAndModelSearchResults>;
  suggestionsAction: () => Promise<CatalogModel[]>;
};

export function SearchOverlay({ searchAction, suggestionsAction }: SearchOverlayProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<BrandAndModelSearchResults>({ brands: [], models: [] });
  const [suggested, setSuggested] = useState<CatalogModel[]>([]);
  const [recent, setRecent] = useState<RecentlyViewedListing[]>([]);
  const [isSearching, startSearching] = useTransition();
  const router = useRouter();

  const browsing = term.trim().length < 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  function go(href: string) {
    setOpen(false);
    setTerm('');
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-10 w-full justify-start gap-2 font-normal text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        Search cameras, lenses and brands
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-xs sm:inline">⌘K</kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search cameras, lenses and brands"
        className="top-24 sm:max-w-2xl"
      >
        <Command shouldFilter={false} className="p-2">
          <CommandInput
            placeholder="Try “fuji xt3”, “helios” or “sony”"
            value={term}
            onValueChange={setTerm}
          />
          <CommandList className="mt-2 max-h-[min(28rem,60vh)]">
            {browsing ? (
              <>
                {recent.length > 0 ? (
                  <CommandGroup className="p-2" heading="Recently viewed">
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
                  <CommandGroup className="p-2" heading="Suggested">
                    {suggested.map((model) => (
                      <ModelItem key={model.id} model={model} onSelect={go} />
                    ))}
                  </CommandGroup>
                ) : null}
                {recent.length === 0 && suggested.length === 0 ? (
                  <CommandEmpty>{isSearching ? 'Loading…' : 'Start typing.'}</CommandEmpty>
                ) : null}
              </>
            ) : (
              <>
                {results.brands.length > 0 ? (
                  <CommandGroup className="p-2" heading="Brands">
                    {results.brands.map((brand) => (
                      <CommandItem
                        className="px-3 py-2.5"
                        key={brand.slug}
                        value={`brand:${brand.slug}`}
                        onSelect={() => go(`/?brand=${brand.slug}`)}
                      >
                        <div className="flex flex-1 items-center justify-between gap-4">
                          <span>{brand.name}</span>
                          <span className="text-xs text-muted-foreground">Brand</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {results.models.length > 0 ? (
                  <CommandGroup className="p-2" heading="Models">
                    {results.models.map((model) => (
                      <ModelItem key={model.id} model={model} onSelect={go} />
                    ))}
                  </CommandGroup>
                ) : null}
                {results.brands.length === 0 && results.models.length === 0 ? (
                  <CommandEmpty>{isSearching ? 'Searching…' : 'Nothing found.'}</CommandEmpty>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

function ModelItem({ model, onSelect }: { model: CatalogModel; onSelect: (href: string) => void }) {
  return (
    <CommandItem
      className="px-3 py-2.5"
      value={`model:${model.slug}`}
      onSelect={() => onSelect(`/?model=${model.slug}`)}
    >
      <div className="flex flex-col gap-0.5">
        <span>{model.displayName}</span>
        <span className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[model.category]}
          {model.mount ? ` · ${model.mount.name}` : ''}
          {model.isFilm ? ' · Film' : ''}
        </span>
      </div>
    </CommandItem>
  );
}
