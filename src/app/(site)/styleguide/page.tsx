import { CameraIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ListingCard } from '@/components/features/browse/listing-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

const colors = [
  { name: 'background', className: 'bg-background' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'accent', className: 'bg-accent' },
  { name: 'border', className: 'bg-border' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'destructive', className: 'bg-destructive' },
];

const buttonVariantNames = [
  'default',
  'dark',
  'secondary',
  'outline',
  'ghost',
  'destructive',
  'link',
] as const;

const sampleCard = {
  href: '#',
  title: 'Sony FE 24-70mm F2.8 GM II',
  subtitle: 'Sony',
  detail: 'Sony E',
  priceCents: 189000,
  condition: 'Excellent',
  imageUrl: null,
  isBundle: false,
  statusLabel: null,
  editHref: null,
};

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-bold text-4xl">Styleguide</h1>
        <p className="text-muted-foreground">Every primitive in one place. Development only.</p>
      </div>

      <Section title="Colors">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-7">
          {colors.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`aspect-square rounded-2xl ring-1 ring-foreground/10 ${color.className}`}
              />
              <span className="text-xs text-muted-foreground">{color.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-4">
          <p className="font-heading font-bold text-5xl">Heading one, Geist</p>
          <p className="font-heading font-bold text-4xl">Heading two, Geist</p>
          <p className="font-heading font-bold text-2xl">Heading three, Geist</p>
          <p className="text-xl font-medium">Fujifilm X-T3 — a model name stays in Inter</p>
          <p className="max-w-prose text-base">
            Body text in Inter. Every ad is tied to a real model, so specs and search actually work.
            Sellers pick a curated model from a catalog instead of typing free text.
          </p>
          <p className="max-w-prose text-sm text-muted-foreground">
            Secondary text, small and muted. Used for details, captions and helper copy.
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {buttonVariantNames.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Icon">
              <CameraIcon />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="sg-input">Input</FieldLabel>
            <Input id="sg-input" placeholder="Fujifilm X-T3" />
          </Field>
          <Field>
            <FieldLabel htmlFor="sg-select">Native select</FieldLabel>
            <NativeSelect id="sg-select" defaultValue="good">
              <NativeSelectOption value="mint">Mint</NativeSelectOption>
              <NativeSelectOption value="good">Good</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="sg-textarea">Textarea</FieldLabel>
            <Textarea id="sg-textarea" placeholder="Describe the item" />
          </Field>
          <Label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            Original box
          </Label>
        </div>
      </Section>

      <Section title="Alerts">
        <div className="flex max-w-2xl flex-col gap-3">
          <Alert>
            <AlertTitle>Draft saved</AlertTitle>
            <AlertDescription>Your ad is saved and only you can see it.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Could not publish</AlertTitle>
            <AlertDescription>Add a price and a city first.</AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section title="Listing card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          <ListingCard item={sampleCard} />
          <ListingCard
            item={{
              ...sampleCard,
              title: 'Canon EOS R6 Mark II + RF 24-105mm F4 L IS USM',
              subtitle: '2 items',
              detail: '12,400 shutter actuations',
              priceCents: 265000,
              isBundle: true,
            }}
          />
          <ListingCard item={{ ...sampleCard, statusLabel: 'Draft', editHref: '#' }} />
          <ListingCard item={{ ...sampleCard, priceCents: null, condition: '' }} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="border-b pb-3 font-heading font-bold text-2xl">{title}</h2>
      {children}
    </section>
  );
}
