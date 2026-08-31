import { ListingCard, type ListingCardItem } from '@/components/features/catalog/listing-card';
import { Badge } from '@/components/ui/badge';

const placeholderListings: ListingCardItem[] = [
  {
    slug: 'fujifilm-x-t3-1',
    model: 'X-T3',
    brand: 'Fujifilm',
    priceCents: 62000,
    condition: 'Excellent',
    detail: '18 400 shutter actuations',
  },
  {
    slug: 'sony-a7-iii-1',
    model: 'A7 III',
    brand: 'Sony',
    priceCents: 98000,
    condition: 'Good',
    detail: '42 100 shutter actuations',
  },
  {
    slug: 'canon-eos-r6-1',
    model: 'EOS R6',
    brand: 'Canon',
    priceCents: 132000,
    condition: 'Excellent',
    detail: '9 800 shutter actuations',
  },
  {
    slug: 'fujifilm-xf-35mm-1',
    model: 'XF 35mm f/1.4 R',
    brand: 'Fujifilm',
    priceCents: 34000,
    condition: 'Good',
    detail: 'Fujifilm X mount',
  },
  {
    slug: 'nikon-z6-ii-1',
    model: 'Z6 II',
    brand: 'Nikon',
    priceCents: 115000,
    condition: 'Well used',
    detail: '76 300 shutter actuations',
  },
  {
    slug: 'sigma-35mm-art-1',
    model: '35mm f/1.4 DG HSM Art',
    brand: 'Sigma',
    priceCents: 45000,
    condition: 'Excellent',
    detail: 'Canon EF mount',
  },
  {
    slug: 'ricoh-gr-iii-1',
    model: 'GR III',
    brand: 'Ricoh',
    priceCents: 68000,
    condition: 'Good',
    detail: 'Fixed 28mm equivalent',
  },
  {
    slug: 'panasonic-lumix-gh5-1',
    model: 'Lumix GH5',
    brand: 'Panasonic',
    priceCents: 52000,
    condition: 'Well used',
    detail: 'Micro Four Thirds',
  },
];

const filters = ['All', 'Cameras', 'Lenses', 'Stores only'];

export function Catalog() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Used cameras and lenses
        </h1>
        <p className="text-muted-foreground">
          Every listing is tied to a real model, so specs and search actually work.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <Badge key={filter} variant={index === 0 ? 'default' : 'outline'}>
            {filter}
          </Badge>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {placeholderListings.map((item) => (
          <ListingCard key={item.slug} item={item} />
        ))}
      </div>
    </>
  );
}
