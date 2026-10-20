import type { Metadata } from 'next';
import type { getTranslations } from 'next-intl/server';
import type { BrowseFilters } from './browse-filters';
import { OPEN_GRAPH_BASE } from './site';

type TranslateBrowse = Awaited<ReturnType<typeof getTranslations<'browse'>>>;

type BrowseNames = { brand: string | null; model: string | null };

function canonicalPath(filters: BrowseFilters, names: BrowseNames) {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (names.brand && filters.brand) params.set('brand', filters.brand);
  if (names.model && filters.model) params.set('model', filters.model);

  const query = params.toString();

  return query ? `/?${query}` : '/';
}

function browseTitle(filters: BrowseFilters, names: BrowseNames, t: TranslateBrowse) {
  if (names.model) return t('meta.model', { model: names.model });
  if (names.brand)
    return t('meta.brand', { brand: names.brand, category: filters.category ?? 'all' });
  if (filters.category) return t('meta.category', { category: filters.category });

  return null;
}

export function browseMetadata(
  filters: BrowseFilters,
  names: BrowseNames,
  t: TranslateBrowse,
  site: { title: string; description: string },
): Metadata {
  const filteredTitle = browseTitle(filters, names, t);
  const title = filteredTitle ?? site.title;
  const path = canonicalPath(filters, names);
  const description = filteredTitle
    ? t('meta.description', { title: filteredTitle })
    : site.description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...OPEN_GRAPH_BASE, url: path, title, description },
  };
}
