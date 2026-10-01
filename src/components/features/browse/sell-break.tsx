import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function SellBreak() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-sun px-6 py-12 text-sun-foreground sm:px-12 sm:py-16">
      <div
        aria-hidden
        className="absolute -top-16 -right-16 size-72 rounded-full border-[28px] border-white/30 sm:-top-20 sm:-right-10 sm:size-96"
      />
      <div
        aria-hidden
        className="absolute right-24 bottom-6 size-24 rounded-full bg-white/25 sm:right-40 sm:bottom-10"
      />

      <div className="relative max-w-xl">
        <h2 className="font-heading font-bold text-3xl leading-tight text-balance sm:text-4xl">
          Got a camera gathering dust?
        </h2>
        <p className="mt-3 text-base text-sun-foreground/80 sm:text-lg">
          Pick the model from the catalog, answer the questions buyers actually ask, and your ad is
          up. No title to invent.
        </p>
        <Link href="/sell" className={buttonVariants({ size: 'lg', className: 'mt-8' })}>
          Sell gear
        </Link>
      </div>
    </section>
  );
}
