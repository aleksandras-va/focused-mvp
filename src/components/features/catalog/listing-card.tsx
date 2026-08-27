import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export type ListingCardItem = {
  slug: string;
  model: string;
  brand: string;
  priceCents: number;
  condition: string;
  detail: string;
};

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function ListingCard({ item }: { item: ListingCardItem }) {
  return (
    <Card className="overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <Link href={`/listings/${item.slug}`} className="block">
        <div className="flex aspect-4/3 items-center justify-center bg-muted">
          <ImageIcon className="size-8 text-muted-foreground/50" />
        </div>
      </Link>

      <CardContent className="space-y-1">
        <p className="text-xs text-muted-foreground">{item.brand}</p>
        <Link href={`/listings/${item.slug}`} className="hover:underline">
          <h3 className="font-medium leading-tight">{item.model}</h3>
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
