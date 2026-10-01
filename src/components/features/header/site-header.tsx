'use client';

import { SearchIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MobileMenu } from '@/components/features/header/mobile-menu';
import { useScrolled } from '@/components/features/header/use-scrolled';
import { SearchDialog } from '@/components/features/search';
import { SearchTrigger } from '@/components/features/search/search-trigger';
import { Button, buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import type {
  BrandAndModelSearchResults,
  CatalogModel,
} from '@/services/model-catalog/model-catalog.types';

type SiteHeaderProps = {
  user: { displayName: string } | null;
  searchAction: (term: string) => Promise<BrandAndModelSearchResults>;
  suggestionsAction: () => Promise<CatalogModel[]>;
};

const navigation = [
  { href: '/?category=camera', label: 'Cameras' },
  { href: '/?category=lens', label: 'Lenses' },
  { href: '/?category=accessory', label: 'Accessories' },
  { href: '/stores', label: 'Stores' },
];

const centerSlotClass = 'absolute transition-[opacity,visibility] duration-200';

export function SiteHeader({ user, searchAction, suggestionsAction }: SiteHeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const [searchOpen, setSearchOpen] = useState(false);
  const expanded = pathname === '/' && !scrolled;
  const openSearch = () => setSearchOpen(true);

  return (
    <header
      data-expanded={expanded || undefined}
      data-compact={expanded ? undefined : true}
      className="group/header fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-[padding] duration-300 ease-out data-expanded:p-0 sm:px-4"
    >
      <div className="mx-auto max-w-nav rounded-[1.75rem] border-b border-transparent bg-background/85 pr-2 pl-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] ring-1 ring-foreground/10 backdrop-blur-xl transition-[max-width,border-radius,box-shadow,border-color,background-color,padding] duration-300 ease-out group-data-expanded/header:max-w-full group-data-expanded/header:rounded-none group-data-expanded/header:border-border group-data-expanded/header:bg-background group-data-expanded/header:pr-5 group-data-expanded/header:pl-7 group-data-expanded/header:pt-2 group-data-expanded/header:shadow-none group-data-expanded/header:ring-0 sm:pl-5 sm:group-data-expanded/header:pr-6 sm:group-data-expanded/header:pl-9">
        <div className="mx-auto max-w-[calc(var(--container-nav)-1.75rem)]">
          <div className="relative flex h-14 items-center gap-1">
            <Link href="/" className="mr-3 flex items-center">
              <Logo />
            </Link>

            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
              <nav
                className={cn(
                  centerSlotClass,
                  'pointer-events-auto flex items-center group-data-compact/header:invisible group-data-compact/header:opacity-0',
                )}
              >
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div
                className={cn(
                  centerSlotClass,
                  'pointer-events-auto w-full max-w-xs group-data-expanded/header:invisible group-data-expanded/header:opacity-0 lg:max-w-md',
                )}
              >
                <SearchTrigger onClick={openSearch} />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                className="group-data-expanded/header:hidden md:hidden"
                onClick={openSearch}
              >
                <SearchIcon className="size-5" />
              </Button>

              {user ? (
                <Link
                  href="/user"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'hidden px-2 md:inline-flex')}
                >
                  <UserIcon />
                  <span className="hidden max-w-32 truncate lg:inline">{user.displayName}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}
                >
                  Log in
                </Link>
              )}

              <Link href="/sell" className={buttonVariants({ variant: 'sun' })}>
                Sell gear
              </Link>

              <MobileMenu user={user} navigation={navigation} />
            </div>
          </div>

          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-data-expanded/header:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="flex justify-center pt-2 pb-5">
                <SearchTrigger onClick={openSearch} className="h-12 max-w-xl text-base" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        searchAction={searchAction}
        suggestionsAction={suggestionsAction}
      />
    </header>
  );
}
