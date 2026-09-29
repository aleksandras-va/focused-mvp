import { redirect } from 'next/navigation';
import { Account } from '@/components/features/account';
import { authService } from '@/services/auth/auth.service';
import { cityService } from '@/services/city/city.service';
import { listingService } from '@/services/listing/listing.service';
import { openStoreAction, signOutAction, updateProfileAction } from './actions';

const SAVED_MESSAGES: Record<string, string> = {
  profile: 'Profile saved.',
  store: 'Your store is open.',
};

export default async function UserPage({ searchParams }: PageProps<'/user'>) {
  const user = await authService.getCurrentUserCached();

  if (!user) redirect('/login');

  const { error, saved } = await searchParams;
  const listings = await listingService.getSellerListings(user.id);
  const cities = await cityService.getAll();

  const pageMessage =
    typeof error === 'string'
      ? { kind: 'error' as const, message: error }
      : typeof saved === 'string' && SAVED_MESSAGES[saved]
        ? { kind: 'saved' as const, message: SAVED_MESSAGES[saved] }
        : null;

  return (
    <Account
      user={user}
      cities={cities}
      listings={listings}
      notice={pageMessage}
      updateProfileAction={updateProfileAction}
      openStoreAction={openStoreAction}
      signOutAction={signOutAction}
    />
  );
}
