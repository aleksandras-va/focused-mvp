import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { SiteFooter } from '@/components/features/footer/site-footer';
import { SiteHeader } from '@/components/features/header/site-header';
import { authService } from '@/services/auth/auth.service';
import { conversationService } from '@/services/conversation/conversation.service';
import { getSearchSuggestionsAction, searchSiteAction, trackSearchAction } from './actions';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
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
  const unreadMessages = user ? await conversationService.countUnread(user.id) : 0;

  return (
    <html
      lang={await getLocale()}
      className={cn(inter.variable, bricolage.variable, 'h-full', 'antialiased')}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <SiteHeader
            user={user ? { displayName: user.displayName, unreadMessages } : null}
            searchAction={searchSiteAction}
            suggestionsAction={getSearchSuggestionsAction}
            trackSearchAction={trackSearchAction}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
