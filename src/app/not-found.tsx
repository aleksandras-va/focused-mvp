import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-4 pt-[calc(var(--spacing-header)+4rem)] pb-24 text-center sm:px-6">
      <p className="font-heading text-7xl font-bold text-muted-foreground/40">404</p>
      <h1 className="font-heading text-3xl font-bold">Nothing here</h1>
      <p className="max-w-md text-muted-foreground">
        The ad may have been sold or removed, or the link is wrong.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          Home
        </Link>
        <Link href="/items" className={buttonVariants()}>
          Browse items
        </Link>
      </div>
    </div>
  );
}
