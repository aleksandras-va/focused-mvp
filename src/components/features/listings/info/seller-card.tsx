import { ChevronRightIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ListingDetail } from '@/services/listing/listing.types';

interface SellerCardProps {
  seller: ListingDetail['seller'];
  phone: string | null;
  city: string | null;
  isSignedIn: boolean;
}

export function SellerCard({ seller, phone, city, isSignedIn }: SellerCardProps) {
  const name = seller.storeName ?? seller.name;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Link
          href={`/sellers/${seller.id}`}
          className="group flex items-center justify-between gap-3"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-2 font-medium group-hover:underline">
                <span className="truncate">{name}</span>
                {seller.isStore ? <Badge variant="secondary">Store</Badge> : null}
              </span>
              <span className="text-xs text-muted-foreground">{city ?? 'City not set'}</span>
            </span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <SellerPhone phone={phone} isSignedIn={isSignedIn} />
          <Button variant="outline" size="sm">
            <MessageCircleIcon />
            Write a message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SellerPhone({ phone, isSignedIn }: { phone: string | null; isSignedIn: boolean }) {
  if (!phone) return <span className="text-muted-foreground">No phone number</span>;

  if (!isSignedIn) {
    return (
      <Link href="/login" className="text-muted-foreground underline-offset-4 hover:underline">
        Log in to see the phone number
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2 font-medium">
      <PhoneIcon className="size-4 text-muted-foreground" />
      {phone}
    </span>
  );
}
