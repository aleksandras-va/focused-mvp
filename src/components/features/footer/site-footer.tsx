import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/logo';

const contactEmail = 'info@expose.lt';

export function SiteFooter() {
  const t = useTranslations();
  const links = [
    { href: '/?category=camera', label: t('enums.categoryPlural.camera') },
    { href: '/?category=lens', label: t('enums.categoryPlural.lens') },
    { href: '/?category=accessory', label: t('enums.categoryPlural.accessory') },
    { href: '/sell', label: t('common.sellGear') },
    { href: '/about', label: t('common.about') },
  ];

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-start gap-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{t('footer.tagline')}</p>
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
        © {new Date().getFullYear()} exposé · {t('footer.country')} ·{' '}
        <a href={`mailto:${contactEmail}`} className="transition-colors hover:text-foreground">
          {contactEmail}
        </a>
      </div>
    </footer>
  );
}
