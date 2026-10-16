import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-4 pt-[calc(var(--spacing-header)+4rem)] pb-24 text-center sm:px-6">
      <p className="font-heading text-7xl font-semibold text-muted-foreground/40">404</p>
      <h1 className="font-heading text-3xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-muted-foreground">{t('description')}</p>
      <div className="mt-2 flex gap-2">
        <Link href="/" className={buttonVariants()}>
          {t('browse')}
        </Link>
      </div>
    </div>
  );
}
