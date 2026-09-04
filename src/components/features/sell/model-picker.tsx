'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CatalogModel } from '@/services/catalog-service';

type ModelPickerProps = {
  searchAction: (term: string) => Promise<CatalogModel[]>;
  selected: CatalogModel | null;
  onSelect: (model: CatalogModel) => void;
};

export function ModelPicker({ searchAction, selected, onSelect }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CatalogModel[]>([]);
  const [isSearching, startSearching] = useTransition();

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startSearching(async () => {
        setResults(await searchAction(term));
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [term, searchAction]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="h-9 w-full justify-between font-normal">
            <span className={selected ? '' : 'text-muted-foreground'}>
              {selected ? selected.displayName : 'Search for a camera, lens or accessory'}
            </span>
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Try “fuji xt3” or “nifty fifty”"
            value={term}
            onValueChange={setTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching ? 'Searching…' : term ? 'Nothing found.' : 'Start typing.'}
            </CommandEmpty>
            {results.map((model) => (
              <CommandItem
                key={model.id}
                value={model.id}
                onSelect={() => {
                  onSelect(model);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span>{model.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.mount ? model.mount.name : 'Fixed lens'}
                    {model.releaseYear ? ` · ${model.releaseYear}` : ''}
                  </span>
                </div>
                {selected?.id === model.id ? <CheckIcon className="ml-auto" /> : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
