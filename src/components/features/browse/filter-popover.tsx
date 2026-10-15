'use client';

import { SlidersHorizontalIcon } from 'lucide-react';
import Form from 'next/form';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type BrowseFilters, browseHref, countAdvancedFilters } from '@/lib/browse-filters';
import { COSMETIC_CONDITIONS } from '@/lib/listing-options';

interface FilterPopoverProps {
  filters: BrowseFilters;
  options: {
    brands: { slug: string; name: string }[];
    mounts: { slug: string; name: string }[];
    cities: { slug: string; name: string }[];
  };
}

const withoutAdvancedFilters = {
  brand: null,
  mount: null,
  city: null,
  cosmeticCondition: null,
  minPriceCents: null,
  maxPriceCents: null,
};

function skipEmptyFields(form: HTMLFormElement) {
  for (const field of form.elements) {
    const isEmpty =
      (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) &&
      field.value === '';

    if (isEmpty) field.disabled = true;
  }
}

export function FilterPopover({ filters, options }: FilterPopoverProps) {
  const t = useTranslations('browse.filters');
  const tEnums = useTranslations('enums');
  const [open, setOpen] = useState(false);
  const activeCount = countAdvancedFilters(filters);
  const euros = (value: number | null) => (value === null ? '' : String(value / 100));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <SlidersHorizontalIcon />
        {t('button')}
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-4">
        <Form
          key={browseHref(filters)}
          action="/"
          scroll={false}
          onSubmit={(event) => {
            skipEmptyFields(event.currentTarget);
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          {filters.category ? (
            <input type="hidden" name="category" value={filters.category} />
          ) : null}
          {filters.model ? <input type="hidden" name="model" value={filters.model} /> : null}
          {filters.sort !== 'newest' ? (
            <input type="hidden" name="sort" value={filters.sort} />
          ) : null}

          <Field>
            <FieldLabel htmlFor="filter-brand">{t('brand')}</FieldLabel>
            <NativeSelect
              id="filter-brand"
              name="brand"
              defaultValue={filters.brand ?? ''}
              className="w-full"
            >
              <NativeSelectOption value="">{t('allBrands')}</NativeSelectOption>
              {options.brands.map((brand) => (
                <NativeSelectOption key={brand.slug} value={brand.slug}>
                  {brand.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-mount">{t('mount')}</FieldLabel>
            <NativeSelect
              id="filter-mount"
              name="mount"
              defaultValue={filters.mount ?? ''}
              className="w-full"
            >
              <NativeSelectOption value="">{t('allMounts')}</NativeSelectOption>
              {options.mounts.map((mount) => (
                <NativeSelectOption key={mount.slug} value={mount.slug}>
                  {mount.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-city">{t('city')}</FieldLabel>
            <NativeSelect
              id="filter-city"
              name="city"
              defaultValue={filters.city ?? ''}
              className="w-full"
            >
              <NativeSelectOption value="">{t('allCities')}</NativeSelectOption>
              {options.cities.map((city) => (
                <NativeSelectOption key={city.slug} value={city.slug}>
                  {city.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-condition">{t('condition')}</FieldLabel>
            <NativeSelect
              id="filter-condition"
              name="condition"
              defaultValue={filters.cosmeticCondition ?? ''}
              className="w-full"
            >
              <NativeSelectOption value="">{t('anyCondition')}</NativeSelectOption>
              {COSMETIC_CONDITIONS.map(({ value }) => (
                <NativeSelectOption key={value} value={value}>
                  {tEnums(`cosmeticCondition.${value}`)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-min">{t('price')}</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="filter-min"
                name="min"
                type="number"
                min="0"
                step="1"
                placeholder={t('min')}
                aria-label={t('minPrice')}
                defaultValue={euros(filters.minPriceCents)}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                name="max"
                type="number"
                min="0"
                step="1"
                placeholder={t('max')}
                aria-label={t('maxPrice')}
                defaultValue={euros(filters.maxPriceCents)}
              />
            </div>
          </Field>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Link
              href={browseHref(filters, withoutAdvancedFilters)}
              scroll={false}
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: 'ghost' })}
            >
              {t('clear')}
            </Link>
            <Button type="submit">{t('showResults')}</Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
