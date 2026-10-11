import { MessageCircleIcon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContactActionsProps {
  phone: string | null;
  isSignedIn: boolean;
}

const phoneButtonClass = cn(
  buttonVariants({ variant: 'outline', size: 'lg' }),
  'w-full border-input',
);

export function ContactActions({ phone, isSignedIn }: ContactActionsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Button size="lg" className="w-full">
        <MessageCircleIcon />
        Message seller
      </Button>
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
