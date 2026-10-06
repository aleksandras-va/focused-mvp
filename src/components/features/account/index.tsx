import { CircleAlertIcon, CircleCheckIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import type { AuthUser } from '@/services/auth/auth.types';
import type { City } from '@/services/city/city.types';
import type { ListingSummary } from '@/services/listing/listing.types';
import { ProfileForm } from './profile-form';
import { SellerListings } from './seller-listings';
import { StoreSection } from './store-section';

interface AccountProps {
  user: AuthUser;
  cities: City[];
  listings: ListingSummary[];
  notice: { kind: 'error' | 'saved'; message: string } | null;
  updateProfileAction: (formData: FormData) => Promise<void>;
  openStoreAction: (formData: FormData) => Promise<void>;
  signOutAction: () => Promise<void>;
}

export function Account({
  user,
  cities,
  listings,
  notice,
  updateProfileAction,
  openStoreAction,
  signOutAction,
}: AccountProps) {
  const name = user.store?.name ?? user.displayName;
  const cityName = cities.find((city) => city.id === user.cityId)?.name ?? null;
  const meta = [user.store ? 'Store' : 'Private seller', cityName, user.email].filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading text-2xl font-extrabold text-primary-ink">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate font-heading text-3xl leading-tight font-extrabold sm:text-4xl">
              {name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{meta.join(' · ')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/sellers/${user.id}`}
            className={buttonVariants({ variant: 'outline', className: 'border-input' })}
          >
            <EyeIcon />
            See public profile
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="text-muted-foreground">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {notice ? (
        <Alert variant={notice.kind === 'error' ? 'destructive' : 'success'}>
          {notice.kind === 'error' ? <CircleAlertIcon /> : <CircleCheckIcon />}
          <AlertTitle>{notice.message}</AlertTitle>
        </Alert>
      ) : null}

      <SellerListings listings={listings} />

      <section className="flex flex-col gap-5">
        <h2 className="font-heading text-2xl font-extrabold">Settings</h2>
        <div className="flex flex-wrap items-start gap-5">
          <ProfileForm user={user} cities={cities} action={updateProfileAction} />
          <StoreSection store={user.store} action={openStoreAction} />
        </div>
      </section>
    </div>
  );
}
