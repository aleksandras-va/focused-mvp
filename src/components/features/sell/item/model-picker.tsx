'use client';

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { CustomItemStep } from '@/components/features/sell/item/custom-item-step';
import { PickerHeader } from '@/components/features/sell/item/picker-header';
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
import { holdKeyboardOpen } from '@/lib/hold-keyboard-open';
import { useMediaQuery } from '@/lib/use-media-query';
import { cn } from '@/lib/utils';
import type { CustomItem } from '@/services/listing/listing.types';
import type { CatalogModel } from '@/services/model-catalog/model-catalog.types';

type ModelPickerProps = {
  siblingModels: CatalogModel[];
  searchAction: (term: string, preferredMountSlugs: string[]) => Promise<CatalogModel[]>;
  selected: CatalogModel | null;
  onSelect: (model: CatalogModel) => void;
  onAddByName: (custom: CustomItem) => void;
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
  const tEnums = useTranslations('enums');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CatalogModel[]>([]);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [customDraft, setCustomDraft] = useState<CustomItem | null>(null);
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
      setSearchedTerm('');
      return;
    }

    const timer = setTimeout(() => {
      startSearching(async () => {
        const found = await searchAction(term, siblingMountSlugs.split(',').filter(Boolean));

        setResults(found);
        setSearchedTerm(term.trim());
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [term, siblingMountSlugs, searchAction]);

  const trimmed = term.trim();
  const isSettled = searchedTerm === trimmed && !isSearching;
  const close = () => {
    setOpen(false);
    setCustomDraft(null);
  };
  const addByName = () => {
    if (isMobile) {
      setCustomDraft({ name: trimmed, category: null });
      return;
    }

    onAddByName({ name: trimmed, category: null });
    close();
  };
  const continueWithCustom = (custom: CustomItem) => {
    onAddByName(custom);
    close();
  };
  const modelMeta = (model: CatalogModel) =>
    isMobile
      ? [tEnums(`category.${model.category}`), model.mount?.name].filter(Boolean).join(' · ')
      : `${model.mount ? model.mount.name : t('fixedLens')}${model.releaseYear ? ` · ${model.releaseYear}` : ''}`;

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
      {!isMobile || trimmed ? (
        <CommandEmpty className="max-sm:px-4 max-sm:pt-10 max-sm:pb-0">
          {!trimmed ? (
            t('startTyping')
          ) : !isSettled ? (
            t('searching')
          ) : (
            <div className="flex flex-col items-center gap-2 max-sm:gap-5">
              <span className="max-sm:font-heading max-sm:text-xl max-sm:font-semibold max-sm:text-primary-ink">
                {t('nothingFound')}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="max-sm:h-12 max-sm:w-full max-sm:rounded-full max-sm:border-transparent max-sm:bg-primary max-sm:text-[0.9375rem] max-sm:text-primary-foreground max-sm:hover:bg-primary/90"
                onClick={addByName}
              >
                {t('addByName', { name: trimmed })}
              </Button>
            </div>
          )}
        </CommandEmpty>
      ) : null}
      {results.map((model) => {
        const sibling = siblingSharingMount(model);

        return (
          <CommandItem
            key={model.id}
            value={model.id}
            className="max-sm:min-h-14 max-sm:rounded-none max-sm:border-b max-sm:border-border/70 max-sm:px-4 max-sm:py-3"
            onSelect={() => {
              onSelect(model);
              close();
            }}
          >
            <div className="flex flex-col max-sm:gap-0.75">
              <span className="max-sm:text-base max-sm:font-medium">{model.displayName}</span>
              <span className="text-xs text-muted-foreground max-sm:text-[0.8125rem]">
                {modelMeta(model)}
              </span>
              {sibling ? (
                <span className="text-xs font-medium text-primary-ink max-sm:mt-1 max-sm:self-start max-sm:rounded-full max-sm:bg-primary-soft max-sm:px-2.5 max-sm:py-0.5 max-sm:font-semibold">
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
          className={cn(
            'flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-left text-[0.9375rem] font-medium text-primary-ink outline-none focus-visible:bg-muted',
            results.length === 0 && 'border-b',
          )}
        >
          <PlusIcon className="size-4.5" />
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
          onClick={() => {
            holdKeyboardOpen();
            setOpen(true);
          }}
        >
          {triggerContent}
        </Button>
        <CommandDialog
          open={open}
          onOpenChange={(next) => (next ? setOpen(true) : close())}
          title={tItem('model')}
          description={t('trigger')}
          fullScreenOnMobile
        >
          {customDraft ? (
            <CustomItemStep
              initial={customDraft}
              onBack={() => setCustomDraft(null)}
              onContinue={continueWithCustom}
            />
          ) : (
            <Command shouldFilter={false} className="p-0">
              <PickerHeader title={tItem('model')} onBack={close} />
              <CommandInput
                placeholder={t('placeholder')}
                value={term}
                onValueChange={setTerm}
                fullScreenOnMobile
                clearLabel={tCommon('clear')}
              />
              {list}
            </Command>
          )}
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
