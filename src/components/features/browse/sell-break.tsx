import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';

const steps = ['pick', 'answer', 'publish'] as const;

export function SellBreak() {
  const t = useTranslations('browse.sellBreak');
  const tCommon = useTranslations('common');

  return (
    <section className="flex flex-wrap items-center gap-x-14 gap-y-10 rounded-3xl bg-primary-soft p-6 sm:p-12">
      <div className="flex min-w-0 flex-[1_1_22rem] flex-col items-start">
        <p className="text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight font-extrabold text-balance sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 max-w-md text-base text-foreground/75 sm:text-lg">{t('description')}</p>
        <Link
          href="/sell"
          className={buttonVariants({ variant: 'dark', size: 'lg', className: 'mt-7' })}
        >
          {tCommon('sellGear')}
        </Link>
      </div>

      <ol className="flex min-w-0 flex-[1_1_26rem] flex-col gap-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-background p-5"
          >
            <span className="w-7 shrink-0 font-heading text-[1.75rem] leading-none font-extrabold text-primary">
              {index + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{t(`steps.${step}.title`)}</span>
              <span className="text-sm text-muted-foreground">
                {t(`steps.${step}.description`)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
