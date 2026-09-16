import { Camera } from 'lucide-react';
import Link from 'next/link';
import { SearchOverlay } from '@/components/features/search';
import { buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import type {
  BrandAndModelSearchResults,
  CatalogModel,
} from '@/services/model-catalog/model-catalog.types';

type SiteHeaderProps = {
  searchAction: (term: string) => Promise<BrandAndModelSearchResults>;
  suggestionsAction: () => Promise<CatalogModel[]>;
};

const navigation = [
  { href: '/?category=camera', label: 'Cameras' },
  { href: '/?category=lens', label: 'Lenses' },
  { href: '/stores', label: 'Stores' },
];

export function SiteHeader({ searchAction, suggestionsAction }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Camera className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">Focused</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2">
          <SearchOverlay searchAction={searchAction} suggestionsAction={suggestionsAction} />
          <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
            Sign in
          </Link>
          <Link href="/sell" className={buttonVariants()}>
            Sell gear
          </Link>
        </div>
      </div>
    </header>
  );
}
