import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import { SiteFooter } from '@/components/features/footer/site-footer';
import { SiteHeader } from '@/components/features/header/site-header';
import { authService } from '@/services/auth/auth.service';
import { getSearchSuggestionsAction, searchSiteAction } from './actions';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'latin-ext'],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'exposé', template: '%s | exposé' },
  description: 'Marketplace for used cameras and lenses',
  openGraph: { type: 'website', siteName: 'exposé' },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await authService.getCurrentUserCached();

  return (
    <html lang="en" className={cn(inter.variable, nunito.variable, 'h-full', 'antialiased')}>
      <body className="flex min-h-full flex-col">
        <SiteHeader
          user={user}
          searchAction={searchSiteAction}
          suggestionsAction={getSearchSuggestionsAction}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
