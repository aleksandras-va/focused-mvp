import { PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import {
  MessageSellerDialog,
  type MessageSellerProps,
} from '@/components/features/listings/info/message-seller-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContactActionsProps {
  phone: string | null;
  isSignedIn: boolean;
  messaging: MessageSellerProps | null;
}

const phoneButtonClass = cn(
  buttonVariants({ variant: 'outline', size: 'lg' }),
  'w-full border-input',
);

export function ContactActions({ phone, isSignedIn, messaging }: ContactActionsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {messaging ? <MessageSellerDialog className="w-full" {...messaging} /> : null}
      {phone && isSignedIn ? (
        <a href={`tel:${phone.replace(/\s+/g, '')}`} className={phoneButtonClass}>
          <PhoneIcon />
          {phone}
        </a>
      ) : null}
      {phone && !isSignedIn ? (
        <Link href="/login" className={phoneButtonClass}>
          <PhoneIcon />
          Log in to see the phone number
        </Link>
      ) : null}
    </div>
  );
}
