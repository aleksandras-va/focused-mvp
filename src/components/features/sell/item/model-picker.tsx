'use client';

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/lib/use-media-query';
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
  const tCommon = useTranslations('common');
  const tItem = useTranslations('sell.item');
  const isMobile = useMediaQuery('(max-width: 639px)');
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

  const trimmed = term.trim();
  const close = () => setOpen(false);
  const addByName = () => {
    onAddByName(trimmed);
    close();
  };

  const triggerContent = (
    <>
      <span className={selected ? '' : 'text-muted-foreground'}>
        {selected ? selected.displayName : t('trigger')}
      </span>
      <ChevronsUpDownIcon className="opacity-50" />
    </>
  );
  const triggerClassName = 'w-full justify-between rounded-xl px-3.5 font-normal';

  const list = (
    <CommandList className="max-sm:max-h-none max-sm:flex-1">
      <CommandEmpty className="max-sm:px-4">
        {isSearching ? (
          t('searching')
        ) : term ? (
          <div className="flex flex-col items-center gap-2">
            <span className="max-sm:font-heading max-sm:text-xl max-sm:font-semibold max-sm:text-primary-ink">
              {t('nothingFound')}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="max-sm:h-12 max-sm:w-full max-sm:rounded-full max-sm:border-transparent max-sm:bg-primary max-sm:text-primary-foreground max-sm:hover:bg-primary/90"
              onClick={addByName}
            >
              {t('addByName', { name: trimmed })}
            </Button>
          </div>
        ) : (
          <span className="max-sm:hidden">{t('startTyping')}</span>
        )}
      </CommandEmpty>
      {results.map((model) => {
        const sibling = siblingSharingMount(model);

        return (
          <CommandItem
            key={model.id}
            value={model.id}
            className="max-sm:min-h-14 max-sm:rounded-none max-sm:px-4 max-sm:py-3"
            onSelect={() => {
              onSelect(model);
              close();
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
      {isMobile && (results.length > 0 || !trimmed) ? (
        <button
          type="button"
          onClick={addByName}
          className="flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left text-sm font-medium text-primary-ink outline-none focus-visible:bg-muted"
        >
          <PlusIcon className="size-4" />
          {tItem('cantFind')}
        </button>
      ) : null}
    </CommandList>
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          className={triggerClassName}
          onClick={() => setOpen(true)}
        >
          {triggerContent}
        </Button>
        <CommandDialog
          open={open}
          onOpenChange={setOpen}
          title={tItem('model')}
          description={t('trigger')}
          fullScreenOnMobile
        >
          <Command shouldFilter={false} className="p-0">
            <CommandInput
              placeholder={t('placeholder')}
              value={term}
              onValueChange={setTerm}
              onBack={close}
              backLabel={tCommon('back')}
            />
            {list}
          </Command>
        </CommandDialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className={triggerClassName}>
            {triggerContent}
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={t('placeholder')} value={term} onValueChange={setTerm} />
          {list}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
