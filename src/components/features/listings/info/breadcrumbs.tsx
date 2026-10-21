import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { modelHref } from '@/lib/model-href';
import type { ListingItemDetail } from '@/services/listing/listing.types';

interface ListingBreadcrumbsProps {
  item: ListingItemDetail | null;
}

export function ListingBreadcrumbs({ item }: ListingBreadcrumbsProps) {
  const t = useTranslations('listing');
  const tEnums = useTranslations('enums');

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {item ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/?category=${item.category}`} />}>
                {tEnums(`categoryPlural.${item.category}`)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {item.brand && item.brandSlug ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={`/?brand=${item.brandSlug}`} />}>
                    {item.brand}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
            {item.modelSlug ? (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href={modelHref(item.modelSlug)} />}>
                    {item.modelName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            ) : null}
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>{t('bundle')}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
