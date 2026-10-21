import { CircleAlertIcon, CircleCheckIcon, EyeIcon, MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UnreadBadge } from '@/components/features/header/unread-badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/services/auth/auth.types';
import type { City } from '@/services/city/city.types';
import type { ListingSummary } from '@/services/listing/listing.types';
import { SellerListings } from './seller-listings';
import { SettingsDialog } from './settings-dialog';

interface AccountProps {
  user: AuthUser;
  cities: City[];
  listings: ListingSummary[];
  unreadMessages: number;
  notice: { kind: 'error' | 'saved'; message: string } | null;
  updateProfileAction: (formData: FormData) => Promise<void>;
  signOutAction: () => Promise<void>;
}

export function Account({
  user,
  cities,
  listings,
  unreadMessages,
  notice,
  updateProfileAction,
  signOutAction,
}: AccountProps) {
  const t = useTranslations('account');
  const name = user.store?.name ?? user.displayName;
  const cityName = cities.find((city) => city.id === user.cityId)?.name ?? null;
  const meta = [cityName, user.email].filter(Boolean);

  return (
    <div className="flex flex-col gap-10">
      <div className="relative flex flex-col gap-5 rounded-2xl border border-accent bg-accent/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4 pr-12 sm:pr-0">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading text-2xl font-semibold text-primary-ink">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate font-heading text-3xl leading-tight font-semibold sm:text-4xl">
              {name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{meta.join(' · ')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Link
            href="/messages"
            className={cn(buttonVariants({ variant: 'outline' }), 'border-input')}
          >
            <MessageCircleIcon />
            {t('messages')}
            <UnreadBadge count={unreadMessages} />
          </Link>
          <Link
            href={`/sellers/${user.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'border-input')}
          >
            <EyeIcon />
            {t('publicProfile')}
          </Link>
          <div className="absolute top-4 right-4 sm:static">
            <SettingsDialog
              user={user}
              cities={cities}
              action={updateProfileAction}
              signOutAction={signOutAction}
            />
          </div>
        </div>
      </div>

      {notice ? (
        <Alert variant={notice.kind === 'error' ? 'destructive' : 'success'}>
          {notice.kind === 'error' ? <CircleAlertIcon /> : <CircleCheckIcon />}
          <AlertTitle>{notice.message}</AlertTitle>
        </Alert>
      ) : null}

      <SellerListings listings={listings} />
    </div>
  );
}
