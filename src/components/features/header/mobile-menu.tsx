'use client';

import { MenuIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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

interface MobileMenuProps {
  user: { displayName: string } | null;
  navigation: { href: string; label: string }[];
}

export function MobileMenu({ user, navigation }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden" />}
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-80">
        <SheetHeader className="pt-5">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
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
            <Link href="/user" onClick={close} className={buttonVariants({ variant: 'outline' })}>
              <UserIcon />
              <span className="truncate">{user.displayName}</span>
            </Link>
          ) : (
            <Link href="/login" onClick={close} className={buttonVariants({ variant: 'outline' })}>
              Log in
            </Link>
          )}
          <Link href="/sell" onClick={close} className={buttonVariants({ variant: 'sun' })}>
            Sell gear
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
