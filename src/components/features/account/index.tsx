import { Button } from '@/components/ui/button';
import type { AuthUser } from '@/services/auth/auth.types';
import type { ListingSummary } from '@/services/listing/listing.types';
import { ProfileForm } from './profile-form';
import { SellerListings } from './seller-listings';
import { StoreSection } from './store-section';

type AccountProps = {
  user: AuthUser;
  listings: ListingSummary[];
  notice: { kind: 'error' | 'saved'; message: string } | null;
  updateProfileAction: (formData: FormData) => Promise<void>;
  openStoreAction: (formData: FormData) => Promise<void>;
  signOutAction: () => Promise<void>;
};

export function Account({
  user,
  listings,
  notice,
  updateProfileAction,
  openStoreAction,
  signOutAction,
}: AccountProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Your account</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      {notice ? (
        <p
          className={
            notice.kind === 'error'
              ? 'rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'
              : 'rounded-lg border bg-muted/50 px-3 py-2 text-sm'
          }
        >
          {notice.message}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileForm user={user} action={updateProfileAction} />
        <StoreSection store={user.store} action={openStoreAction} />
      </div>

      <SellerListings listings={listings} />
    </div>
  );
}
