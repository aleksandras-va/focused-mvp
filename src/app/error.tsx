'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-4 pt-[calc(var(--spacing-header)+4rem)] pb-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted-foreground">
        The page could not be loaded. Try again, or head back to the front page.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Home
        </Link>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
