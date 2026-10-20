import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Account } from '@/components/features/account';
import { NOT_INDEXED } from '@/lib/site';
import type { AccountErrorCode } from '@/services/account/account.types';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { conversationService } from '@/services/conversation/conversation.service';
import { listingService } from '@/services/listing/listing.service';
import { openStoreAction, signOutAction, updateProfileAction } from './actions';

const SAVED_NOTICES = ['profile', 'store'] as const;

export async function generateMetadata() {
  const t = await getTranslations('account');

  return { title: t('metaTitle'), robots: NOT_INDEXED };
}

export default async function UserPage({ searchParams }: PageProps<'/user'>) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const { error, saved } = await searchParams;
  const listings = await listingService.getSellerListings(user.id);
  const cities = await cityService.getAll();
  const unreadMessages = await conversationService.countUnread(user.id);

  const tErrors = await getTranslations('accountErrors');
  const tSaved = await getTranslations('account.saved');
  const savedNotice = SAVED_NOTICES.find((notice) => notice === saved);
  const pageMessage =
    typeof error === 'string' && tErrors.has(error as AccountErrorCode)
      ? { kind: 'error' as const, message: tErrors(error as AccountErrorCode) }
      : savedNotice
        ? { kind: 'saved' as const, message: tSaved(savedNotice) }
        : null;

  return (
    <Account
      user={user}
      cities={cities}
      listings={listings}
      unreadMessages={unreadMessages}
      notice={pageMessage}
      updateProfileAction={updateProfileAction}
      openStoreAction={openStoreAction}
      signOutAction={signOutAction}
    />
  );
}
