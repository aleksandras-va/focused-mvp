'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, buttonVariants } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('errorPage');

  return (
    <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-4 pt-[calc(var(--spacing-header)+4rem)] pb-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">{t('description')}</p>
      <div className="mt-2 flex gap-2">
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>
          {t('home')}
        </Link>
        <Button onClick={reset}>{t('retry')}</Button>
      </div>
    </div>
  );
}
