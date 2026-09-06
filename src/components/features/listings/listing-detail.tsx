import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ListingDetail as Listing, ListingItemDetail } from '@/services/listing/listing.types';

const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const shutterFormatter = new Intl.NumberFormat('en-IE');

export function ListingDetail({ listing }: { listing: Listing }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-3">
        {listing.photos.length > 0 ? (
          <>
            {/* biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer */}
            <img
              src={listing.photos[0].largeUrl}
              alt={listing.title}
              className="aspect-4/3 w-full rounded-xl bg-muted object-contain"
            />
            {listing.photos.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {listing.photos.slice(1).map((photo) => (
                  // biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer
                  <img
                    key={photo.largeUrl}
                    src={photo.largeUrl}
                    alt={listing.title}
                    className="aspect-square w-full rounded-lg bg-muted object-cover"
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-muted">
            <ImageIcon className="size-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {listing.isBundle ? (
            <p className="text-sm text-muted-foreground">Bundle</p>
          ) : (
            <p className="text-sm text-muted-foreground">{listing.items[0]?.brand}</p>
          )}
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{listing.title}</h1>
          <p className="font-heading text-2xl font-semibold">
            {priceFormatter.format(listing.priceCents / 100)}
          </p>
          {listing.status !== 'active' ? (
            <Badge variant="outline" className="w-fit capitalize">
              {listing.status}
            </Badge>
          ) : null}
        </div>

        {listing.items.map((item) => (
          <ListingItemCard key={item.id} item={item} showPrice={listing.isBundle} />
        ))}

        <Card>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Detail label="Location" value={listing.location} />
            <Separator />
            <Detail
              label="Seller"
              value={listing.seller.storeName ?? listing.seller.name}
              badge={listing.seller.isStore ? 'Store' : null}
            />
          </CardContent>
        </Card>

        {listing.description ? (
          <p className="text-sm whitespace-pre-line text-muted-foreground">{listing.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ListingItemCard({ item, showPrice }: { item: ListingItemDetail; showPrice: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 text-sm">
        {showPrice ? (
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">{item.modelName}</span>
            <span className="font-heading font-semibold">
              {priceFormatter.format(item.priceCents / 100)}
            </span>
          </div>
        ) : null}
        <Detail label="Cosmetic" value={item.cosmeticCondition} />
        <Detail label="Functional" value={item.functionalCondition} />
        {item.shutterCount !== null ? (
          <Detail label="Shutter count" value={shutterFormatter.format(item.shutterCount)} />
        ) : null}
        {item.mount ? <Detail label="Mount" value={item.mount} /> : null}
        {item.inclusions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground">Included</span>
            <div className="flex flex-wrap gap-2">
              {item.inclusions.map((inclusion) => (
                <Badge key={inclusion} variant="secondary">
                  {inclusion}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
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
