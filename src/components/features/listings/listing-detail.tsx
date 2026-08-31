import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ListingDetail as Listing } from '@/services/listing-service';

const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const shutterFormatter = new Intl.NumberFormat('en-IE');

export function ListingDetail({ listing }: { listing: Listing }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-muted">
        <ImageIcon className="size-10 text-muted-foreground/50" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{listing.brand}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {listing.modelName}
          </h1>
          <p className="font-heading text-2xl font-semibold">
            {priceFormatter.format(listing.priceCents / 100)}
          </p>
          {listing.status !== 'active' ? (
            <Badge variant="outline" className="w-fit capitalize">
              {listing.status}
            </Badge>
          ) : null}
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Detail label="Cosmetic" value={listing.cosmeticCondition} />
            <Detail label="Functional" value={listing.functionalCondition} />
            {listing.shutterCount !== null ? (
              <Detail label="Shutter count" value={shutterFormatter.format(listing.shutterCount)} />
            ) : null}
            {listing.mount ? <Detail label="Mount" value={listing.mount} /> : null}
            <Detail label="Location" value={listing.location} />
            <Separator />
            <Detail
              label="Seller"
              value={listing.seller.storeName ?? listing.seller.name}
              badge={listing.seller.isStore ? 'Store' : null}
            />
          </CardContent>
        </Card>

        {listing.inclusions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium">Included</h2>
            <div className="flex flex-wrap gap-2">
              {listing.inclusions.map((inclusion) => (
                <Badge key={inclusion} variant="secondary">
                  {inclusion}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {listing.description ? (
          <p className="text-sm whitespace-pre-line text-muted-foreground">{listing.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value, badge }: { label: string; value: string; badge?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right font-medium">
        {value}
        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      </span>
    </div>
  );
}
