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
import { CATEGORY_LABELS } from '@/lib/listing-options';
import { type RecentlyViewedListing, readRecentlyViewed } from '@/lib/recently-viewed';
import type {
  BrandAndModelSearchResults,
  CatalogModel,
} from '@/services/model-catalog/model-catalog.types';

const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

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
        className="hidden w-56 justify-start gap-2 font-normal text-muted-foreground sm:flex"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        Search gear
        <kbd className="ml-auto rounded border bg-muted px-1.5 text-xs">⌘K</kbd>
      </Button>
      <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
        <SearchIcon />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search cameras, lenses and brands"
        className="top-24"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Try “fuji xt3”, “helios” or “sony”"
            value={term}
            onValueChange={setTerm}
          />
          <CommandList>
            {browsing ? (
              <>
                {recent.length > 0 ? (
                  <CommandGroup heading="Recently viewed">
                    {recent.map((listing) => (
                      <CommandItem
                        key={listing.id}
                        value={`recent:${listing.id}`}
                        onSelect={() => go(`/listings/${listing.id}`)}
                      >
                        <span>{listing.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {priceFormatter.format(listing.priceCents / 100)}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {suggested.length > 0 ? (
                  <CommandGroup heading="Suggested">
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
                  <CommandGroup heading="Brands">
                    {results.brands.map((brand) => (
                      <CommandItem
                        key={brand.slug}
                        value={`brand:${brand.slug}`}
                        onSelect={() => go(`/?brand=${brand.slug}`)}
                      >
                        {brand.name}
                        <span className="ml-auto text-xs text-muted-foreground">Brand</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
                {results.models.length > 0 ? (
                  <CommandGroup heading="Models">
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
    <CommandItem value={`model:${model.slug}`} onSelect={() => onSelect(`/?model=${model.slug}`)}>
      <div className="flex flex-col">
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
