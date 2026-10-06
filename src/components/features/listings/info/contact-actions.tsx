import { MessageCircleIcon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

interface ContactActionsProps {
  phone: string | null;
  isSignedIn: boolean;
}

export function ContactActions({ phone, isSignedIn }: ContactActionsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <Button size="lg" className="w-full">
        <MessageCircleIcon />
        Message seller
      </Button>
      {phone && isSignedIn ? (
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className={buttonVariants({
            variant: 'outline',
            size: 'lg',
            className: 'w-full border-input',
          })}
        >
          <PhoneIcon />
          {phone}
        </a>
      ) : null}
      {phone && !isSignedIn ? (
        <Link
          href="/login"
          className={buttonVariants({
            variant: 'outline',
            size: 'lg',
            className: 'w-full border-input',
          })}
        >
          <PhoneIcon />
          Log in to see the phone number
        </Link>
      ) : null}
    </div>
  );
}
