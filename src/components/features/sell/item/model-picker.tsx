'use client';

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

type ModelPickerProps = {
  siblingModels: CatalogModel[];
  searchAction: (term: string, preferredMountSlugs: string[]) => Promise<CatalogModel[]>;
  selected: CatalogModel | null;
  onSelect: (model: CatalogModel) => void;
  onAddByName: (name: string) => void;
};

export function ModelPicker({
  siblingModels,
  searchAction,
  selected,
  onSelect,
  onAddByName,
}: ModelPickerProps) {
  const t = useTranslations('sell.picker');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CatalogModel[]>([]);
  const [isSearching, startSearching] = useTransition();
  const siblingMountSlugs = [
    ...new Set(siblingModels.flatMap((sibling) => (sibling.mount ? [sibling.mount.slug] : []))),
  ]
    .sort()
    .join(',');
  const siblingSharingMount = (model: CatalogModel) =>
    siblingModels.find((sibling) => sibling.mount && sibling.mount.slug === model.mount?.slug);

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startSearching(async () => {
        setResults(await searchAction(term, siblingMountSlugs.split(',').filter(Boolean)));
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [term, siblingMountSlugs, searchAction]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between rounded-xl px-3.5 font-normal"
          >
            <span className={selected ? '' : 'text-muted-foreground'}>
              {selected ? selected.displayName : t('trigger')}
            </span>
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('placeholder')} value={term} onValueChange={setTerm} />
          <CommandList>
            <CommandEmpty>
              {isSearching ? (
                t('searching')
              ) : term ? (
                <div className="flex flex-col items-center gap-2">
                  <span>{t('nothingFound')}</span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAddByName(term.trim());
                      setOpen(false);
                    }}
                  >
                    {t('addByName', { name: term.trim() })}
                  </Button>
                </div>
              ) : (
                t('startTyping')
              )}
            </CommandEmpty>
            {results.map((model) => {
              const sibling = siblingSharingMount(model);

              return (
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
                      {model.mount ? model.mount.name : t('fixedLens')}
                      {model.releaseYear ? ` · ${model.releaseYear}` : ''}
                    </span>
                    {sibling ? (
                      <span className="text-xs font-medium text-primary-ink">
                        {t('sameMount', { model: sibling.displayName })}
                      </span>
                    ) : null}
                  </div>
                  {selected?.id === model.id ? <CheckIcon className="ml-auto" /> : null}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
