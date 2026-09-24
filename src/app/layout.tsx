import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/features/header/site-header';
import { authService } from '@/services/auth/auth.service';
import { getSearchSuggestionsAction, searchSiteAction } from './actions';
import './globals.css';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Focused', template: '%s | Focused' },
  description: 'Marketplace for used cameras and lenses',
  openGraph: { type: 'website', siteName: 'Focused' },
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await authService.getCurrentUserCached();

  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable, 'h-full', 'antialiased')}>
      <body className="flex min-h-full flex-col">
        <SiteHeader
          user={user}
          searchAction={searchSiteAction}
          suggestionsAction={getSearchSuggestionsAction}
        />

        <div className="flex-1">
          <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
