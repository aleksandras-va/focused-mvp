import Link from 'next/link';
import { DetailRow } from '@/components/features/listings/info/detail-row';
import { SoldSeparatelyLip } from '@/components/features/listings/info/sold-separately-lip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCount, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ListingItemDetail } from '@/services/listing/listing.types';

interface ListingItemCardProps {
  item: ListingItemDetail;
  inBundleOverview: boolean;
}

export function ListingItemCard({ item, inBundleOverview }: ListingItemCardProps) {
  const showsSoldSeparately = inBundleOverview && item.soldSeparately;

  return (
    <Card className={cn(showsSoldSeparately && 'pt-0')}>
      {showsSoldSeparately ? <SoldSeparatelyLip /> : null}
      <CardContent className="flex flex-col gap-3 text-sm">
        {inBundleOverview ? (
          <div className="flex items-center justify-between gap-4">
            <Link href={`/items/${item.id}`} className="font-medium hover:underline">
              {item.modelName}
            </Link>
            <span className="font-heading font-semibold">{formatPrice(item.priceCents)}</span>
          </div>
        ) : null}
        <DetailRow label="Cosmetic" value={item.cosmeticCondition} />
        <DetailRow label="Functional" value={item.functionalCondition} />
        {item.shutterCount !== null ? (
          <DetailRow label="Shutter count" value={formatCount(item.shutterCount)} />
        ) : null}
        {item.mount ? <DetailRow label="Mount" value={item.mount} /> : null}
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
