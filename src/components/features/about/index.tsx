import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const PROBLEMS = ['names', 'details'] as const;
const DIFFERENCES = ['catalog', 'questions', 'gearOnly'] as const;

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <p className="text-[1.0625rem] leading-relaxed text-foreground/75">{text}</p>
    </div>
  );
}

function SectionHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h2 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">{title}</h2>
      <p className="text-lg leading-relaxed text-foreground/75">{lead}</p>
    </div>
  );
}

const eyebrowClass = 'text-[0.8125rem] font-semibold tracking-[0.08em] text-primary-ink uppercase';

export function About() {
  const t = useTranslations('about');

  return (
    <div className="flex flex-col gap-16 pt-6 sm:gap-22 sm:pt-10">
      <section className="flex flex-wrap items-center gap-x-18 gap-y-12">
        <div className="flex min-w-0 flex-[1_1_32rem] flex-col gap-6">
          <p className={eyebrowClass}>{t('eyebrow')}</p>
          <h1 className="font-heading text-[2.5rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-[4rem]">
            {t('title')}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/75 sm:text-xl">
            {t('intro')}
          </p>
        </div>
        <div className="mx-auto aspect-square w-full max-w-sm flex-[0_1_24rem] rounded-full bg-primary-soft p-2.5">
          <Image
            src="/images/about/founders.webp"
            alt={t('photoAlt')}
            width={960}
            height={960}
            sizes="(min-width: 640px) 384px, 90vw"
            className="size-full rounded-full object-cover object-[50%_40%]"
            priority
          />
        </div>
      </section>

      <section className="flex flex-col gap-9">
        <SectionHeading title={t('why.title')} lead={t('why.lead')} />
        <div className="flex flex-col gap-7 border-t pt-8">
          {PROBLEMS.map((key) => (
            <TextBlock
              key={key}
              title={t(`why.problems.${key}.title`)}
              text={t(`why.problems.${key}.text`)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-9">
        <SectionHeading title={t('different.title')} lead={t('different.lead')} />
        <div className="flex flex-col gap-7">
          {DIFFERENCES.map((key) => (
            <TextBlock
              key={key}
              title={t(`different.points.${key}.title`)}
              text={t(`different.points.${key}.text`)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-x-14 gap-y-8 rounded-[2rem] border p-6 sm:p-12">
        <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-3">
          <p className={eyebrowClass}>{t('now.eyebrow')}</p>
          <h2 className="font-heading text-[1.75rem] leading-tight font-semibold sm:text-[2rem]">
            {t('now.title')}
          </h2>
        </div>
        <div className="flex min-w-0 flex-[1.4_1_24rem] flex-col gap-4 text-[1.0625rem] leading-relaxed text-foreground/75">
          <p>{t('now.early')}</p>
          <p>{t('now.catalog')}</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-primary p-6 text-background sm:p-12 [&_.font-heading]:text-background">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 className="font-heading text-[1.75rem] leading-tight font-semibold sm:text-[2.125rem]">
            {t('cta.title')}
          </h2>
          <p className="text-[1.0625rem] text-background/70">{t('cta.description')}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/sell"
            className="inline-flex h-12 items-center rounded-full bg-background px-6 font-medium text-foreground transition-colors hover:bg-background/85"
          >
            {t('cta.sell')}
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full border border-background/30 px-6 font-medium text-background transition-colors hover:bg-background/10"
          >
            {t('cta.browse')}
          </Link>
        </div>
      </section>
    </div>
  );
}
