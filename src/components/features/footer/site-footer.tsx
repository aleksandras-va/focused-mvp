import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

const links = [
  { href: '/items?category=camera', label: 'Cameras' },
  { href: '/items?category=lens', label: 'Lenses' },
  { href: '/items?category=accessory', label: 'Accessories' },
  { href: '/sell', label: 'Sell gear' },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-start gap-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Used cameras and lenses, listed against a real catalog so search works.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-content px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} exposé · Lithuania
      </div>
    </footer>
  );
}
