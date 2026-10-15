import { ShieldCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SafetyNote() {
  const t = useTranslations('listing');

  return (
    <p className="flex items-start gap-3 rounded-2xl bg-primary-soft p-4 text-sm leading-relaxed text-foreground/80">
      <ShieldCheckIcon className="size-5 shrink-0 text-primary" />
      {t('safety')}
    </p>
  );
}
