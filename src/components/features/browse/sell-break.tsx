import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

const steps = [
  {
    title: 'Pick your model',
    description: 'Choose it from the catalog instead of typing a title.',
  },
  { title: 'Answer what buyers ask', description: 'Shutter count, condition, what is in the box.' },
  { title: 'Add photos and publish', description: 'Up to 12 per ad, of the actual item.' },
];

export function SellBreak() {
  return (
    <section className="flex flex-wrap items-center gap-x-14 gap-y-10 rounded-3xl bg-primary-soft p-6 sm:p-12">
      <div className="flex min-w-0 flex-[1_1_22rem] flex-col items-start">
        <p className="text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase">
          Selling
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight font-extrabold text-balance sm:text-4xl">
          Got a camera gathering dust?
        </h2>
        <p className="mt-4 max-w-md text-base text-foreground/75 sm:text-lg">
          Your ad is built from the catalog, so there is no title to invent and buyers find it by
          model.
        </p>
        <Link
          href="/sell"
          className={buttonVariants({ variant: 'dark', size: 'lg', className: 'mt-7' })}
        >
          Sell gear
        </Link>
      </div>

      <ol className="flex min-w-0 flex-[1_1_26rem] flex-col gap-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-background p-5"
          >
            <span className="w-7 shrink-0 font-heading text-[1.75rem] leading-none font-extrabold text-primary">
              {index + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{step.title}</span>
              <span className="text-sm text-muted-foreground">{step.description}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
