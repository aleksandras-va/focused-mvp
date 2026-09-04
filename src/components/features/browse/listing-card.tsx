import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export type ListingCardItem = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  priceCents: number;
  condition: string;
  imageUrl: string | null;
  isBundle: boolean;
};

const priceFormatter = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function ListingCard({ item }: { item: ListingCardItem }) {
  const href = `/listings/${item.id}`;

  return (
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <Link href={href} className="block">
        {item.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: photos come from R2, not the image optimizer
          <img
            src={item.imageUrl}
            alt={item.title}
            className="aspect-4/3 w-full bg-muted object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-4/3 items-center justify-center bg-muted">
            <ImageIcon className="size-8 text-muted-foreground/50" />
          </div>
        )}
      </Link>

      <CardContent className="space-y-1">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.subtitle}
          {item.isBundle ? <Badge variant="outline">Bundle</Badge> : null}
        </p>
        <Link href={href} className="hover:underline">
          <h3 className="font-medium leading-tight">{item.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </CardContent>

      <CardFooter className="justify-between">
        <span className="font-heading text-lg font-semibold">
          {priceFormatter.format(item.priceCents / 100)}
        </span>
        <Badge variant="secondary">{item.condition}</Badge>
      </CardFooter>
    </Card>
  );
}
