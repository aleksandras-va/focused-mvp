import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CATEGORY_PLURAL_LABELS } from '@/lib/listing-options';
import type { ListingItemDetail } from '@/services/listing/listing.types';

interface ListingBreadcrumbsProps {
  item: ListingItemDetail | null;
}

export function ListingBreadcrumbs({ item }: ListingBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {item ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/?category=${item.category}`} />}>
                {CATEGORY_PLURAL_LABELS[item.category]}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={`/?brand=${item.brandSlug}`} />}>
                {item.brand}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Bundle</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
