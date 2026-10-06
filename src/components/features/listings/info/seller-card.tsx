import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ListingDetail } from '@/services/listing/listing.types';

interface SellerCardProps {
  seller: ListingDetail['seller'];
  city: string | null;
}

export function SellerCard({ seller, city }: SellerCardProps) {
  const name = seller.storeName ?? seller.name;

  return (
    <Link
      href={`/sellers/${seller.id}`}
      className="group flex items-center gap-3 rounded-2xl border p-4 transition-colors hover:bg-muted/50"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-ink">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 font-semibold">
          <span className="truncate">{name}</span>
          {seller.isStore ? <Badge variant="secondary">Store</Badge> : null}
        </span>
        <span className="text-[0.8125rem] text-muted-foreground">
          {seller.isStore ? 'Store' : 'Private seller'} · {city ?? 'City not set'}
        </span>
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </Link>
  );
}
