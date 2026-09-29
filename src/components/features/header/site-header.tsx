'use client';

import { UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScrolled } from '@/components/features/header/use-scrolled';
import { SearchOverlay } from '@/components/features/search';
import { buttonVariants } from '@/components/ui/button';
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
  { href: '/items?category=camera', label: 'Cameras' },
  { href: '/items?category=lens', label: 'Lenses' },
  { href: '/items?category=accessory', label: 'Accessories' },
  { href: '/stores', label: 'Stores' },
];

const navLinkClass =
  'rounded-full px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground group-data-overlay/header:text-white/80 group-data-overlay/header:hover:bg-white/10 group-data-overlay/header:hover:text-white';

export function SiteHeader({ user, searchAction, suggestionsAction }: SiteHeaderProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(24);
  const overlay = pathname === '/' && !scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        data-overlay={overlay || undefined}
        className={cn(
          'group/header mx-auto flex h-14 max-w-nav items-center gap-1 rounded-full bg-background/80 pr-2 pl-4 text-foreground shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] ring-1 ring-foreground/10 backdrop-blur-xl transition-[background-color,box-shadow,color] duration-300 sm:pl-5',
          'data-overlay:bg-transparent data-overlay:text-white data-overlay:shadow-none data-overlay:ring-0 data-overlay:backdrop-blur-none',
        )}
      >
        <Link href="/" className="mr-3 flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
          <SearchOverlay searchAction={searchAction} suggestionsAction={suggestionsAction} />

          {user ? (
            <Link
              href="/user"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'px-2 group-data-overlay/header:hover:bg-white/10 group-data-overlay/header:hover:text-white',
              )}
            >
              <UserIcon />
              <span className="hidden max-w-32 truncate md:inline">{user.displayName}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'hidden group-data-overlay/header:hover:bg-white/10 group-data-overlay/header:hover:text-white sm:inline-flex',
              )}
            >
              Log in
            </Link>
          )}

          <Link href="/sell" className={buttonVariants({ variant: 'sun' })}>
            Sell gear
          </Link>
        </div>
      </div>
    </header>
  );
}
