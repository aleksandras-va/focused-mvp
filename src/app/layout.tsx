import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { SiteFooter } from '@/components/features/footer/site-footer';
import { SiteHeader } from '@/components/features/header/site-header';
import { Preconnect } from '@/components/ui/preconnect';
import { authService } from '@/services/auth/auth.service';
import { conversationService } from '@/services/conversation/conversation.service';
import { photoService } from '@/services/photo/photo.service';
import { getSearchSuggestionsAction, searchSiteAction, trackSearchAction } from './actions';
import './globals.css';
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin', 'latin-ext'],
});

const titlePrefix = process.env.NODE_ENV === 'development' ? 'dev - ' : '';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('site');

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${titlePrefix}${SITE_NAME}`, template: `${titlePrefix}%s | ${SITE_NAME}` },
    description: t('description'),
    openGraph: OPEN_GRAPH_BASE,
    twitter: { card: 'summary_large_image' },
  };
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const user = await authService.getCurrentUserCached();
  const unreadMessages = user ? await conversationService.countUnread(user.id) : 0;

  return (
    <html
      lang={await getLocale()}
      className={cn(inter.variable, bricolage.variable, 'h-full', 'antialiased')}
    >
      <body className="flex min-h-full flex-col">
        <Preconnect origin={photoService.getPublicOrigin()} />
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
