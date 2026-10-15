'use client';

import { MenuIcon, MessageCircleIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UnreadBadge } from '@/components/features/header/unread-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface HeaderUser {
  displayName: string;
  unreadMessages: number;
}

interface MobileMenuProps {
  user: HeaderUser | null;
  navigation: { href: string; label: string }[];
}

export function MobileMenu({ user, navigation }: MobileMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t('header.menu')} className="md:hidden" />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader className="pt-5">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">{t('header.siteNavigation')}</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SheetFooter>
          {user ? (
            <>
              <Link
                href="/messages"
                onClick={close}
                className={buttonVariants({ variant: 'outline' })}
              >
                <MessageCircleIcon />
                {t('common.messages')}
                <UnreadBadge count={user.unreadMessages} />
              </Link>
              <Link href="/user" onClick={close} className={buttonVariants({ variant: 'outline' })}>
                <UserIcon />
                <span className="truncate">{user.displayName}</span>
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={close} className={buttonVariants({ variant: 'outline' })}>
              {t('common.logIn')}
            </Link>
          )}
          <Link href="/sell" onClick={close} className={buttonVariants()}>
            {t('common.sellGear')}
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
